import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSignedDownloadUrl } from '@/lib/storage';
import { batchDownloadSignSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    const rateCheck = checkRateLimit(`batch_download:${ip}`, { limit: 20, windowMs: 60000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Batch download rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      );
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    const body = await req.json();
    const parseResult = batchDownloadSignSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid batch parameters' },
        { status: 400 }
      );
    }

    const { items } = parseResult.data;
    const fileIds = items.map((i) => i.fileId);

    const files = await prisma.downloadFile.findMany({
      where: { id: { in: fileIds } },
      include: {
        software: {
          select: {
            id: true,
            title: true,
            slug: true,
            isPublished: true,
          },
        },
      },
    });

    const results = [];
    const logInserts = [];
    const updateSoftwareIds = new Set<string>();
    const updateFileIds: string[] = [];

    for (const file of files) {
      if (!file.software.isPublished) continue;

      const signedData = await generateSignedDownloadUrl({
        storageKey: file.storageKey,
        fileName: file.fileName,
        fileId: file.id,
        expiresInSeconds: 1800,
        userId,
      });

      results.push({
        softwareId: file.softwareId,
        softwareTitle: file.software.title,
        fileId: file.id,
        fileName: file.fileName,
        fileSize: file.formattedSize,
        downloadUrl: signedData.url,
        expiresAt: signedData.expiresAt,
      });

      updateSoftwareIds.add(file.softwareId);
      updateFileIds.push(file.id);

      logInserts.push(
        prisma.downloadLog.create({
          data: {
            userId,
            softwareId: file.softwareId,
            fileId: file.id,
            platform: file.platform,
            status: 'COMPLETED',
            ipAddress: ip,
            userAgent: userAgent.slice(0, 255),
          },
        })
      );
    }

    // Execute logs and counters in background transaction
    await prisma.$transaction([
      ...logInserts,
      prisma.downloadFile.updateMany({
        where: { id: { in: updateFileIds } },
        data: { downloadCount: { increment: 1 } },
      }),
      prisma.softwareItem.updateMany({
        where: { id: { in: Array.from(updateSoftwareIds) } },
        data: { downloadCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      items: results,
      totalCount: results.length,
    });
  } catch (error) {
    console.error('Error processing batch downloads:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while preparing batch downloads.' },
      { status: 500 }
    );
  }
}
