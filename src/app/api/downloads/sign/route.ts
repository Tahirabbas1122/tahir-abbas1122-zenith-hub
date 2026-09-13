import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSignedDownloadUrl } from '@/lib/storage';
import { downloadSignSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // Rate limiting: Max 60 download signs per minute per IP
    const rateCheck = checkRateLimit(`download_sign:${ip}`, { limit: 60, windowMs: 60000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Download rate limit exceeded. Please wait a few seconds before trying again.' },
        { status: 429 }
      );
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    const body = await req.json();
    const parseResult = downloadSignSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid download parameters' },
        { status: 400 }
      );
    }

    const { fileId, softwareId } = parseResult.data;

    // Fetch file and software details from DB
    const file = await prisma.downloadFile.findUnique({
      where: { id: fileId },
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

    if (!file || file.softwareId !== softwareId || !file.software.isPublished) {
      return NextResponse.json({ error: 'Download file not found or unavailable' }, { status: 404 });
    }

    // Generate secure expiring signed URL
    const signedData = await generateSignedDownloadUrl({
      storageKey: file.storageKey,
      fileName: file.fileName,
      fileId: file.id,
      expiresInSeconds: 1800, // 30 minutes
      userId,
    });

    // Increment download metrics asynchronously
    await prisma.$transaction([
      prisma.softwareItem.update({
        where: { id: softwareId },
        data: { downloadCount: { increment: 1 } },
      }),
      prisma.downloadFile.update({
        where: { id: fileId },
        data: { downloadCount: { increment: 1 } },
      }),
      // Log to user-isolated download history table
      prisma.downloadLog.create({
        data: {
          userId,
          softwareId,
          fileId,
          platform: file.platform,
          status: 'COMPLETED',
          ipAddress: ip,
          userAgent: userAgent.slice(0, 255),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      downloadUrl: signedData.url,
      expiresAt: signedData.expiresAt,
      fileName: file.fileName,
      fileSize: file.formattedSize,
      provider: signedData.provider,
    });
  } catch (error) {
    console.error('Error signing download URL:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while preparing your download.' },
      { status: 500 }
    );
  }
}
