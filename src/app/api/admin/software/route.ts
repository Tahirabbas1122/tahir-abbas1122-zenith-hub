import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, serializeData } from '@/lib/prisma';
import { softwareItemSchema } from '@/lib/validations';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const items = await prisma.softwareItem.findMany({
      include: {
        category: true,
        downloadFiles: true,
        screenshots: true,
        systemRequirements: true,
        _count: {
          select: {
            reviews: true,
            downloadLogs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(serializeData(items));
  } catch (error) {
    console.error('Error fetching admin software items:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = softwareItemSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid software payload' },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Check slug uniqueness
    const existingSlug = await prisma.softwareItem.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug) {
      return NextResponse.json({ error: 'A software item with this slug already exists.' }, { status: 409 });
    }

    const created = await prisma.softwareItem.create({
      data: {
        title: data.title,
        slug: data.slug,
        tagline: data.tagline,
        description: data.description,
        detailedDescription: data.detailedDescription,
        developer: data.developer,
        publisher: data.publisher,
        version: data.version,
        license: data.license,
        categoryId: data.categoryId,
        iconUrl: data.iconUrl,
        heroBannerUrl: data.heroBannerUrl,
        isFeatured: data.isFeatured,
        isTrending: data.isTrending,
        isTopRated: data.isTopRated,
        isPublished: data.isPublished,
        downloadFiles: {
          create: data.downloadFiles?.map((f) => ({
            platform: f.platform,
            architecture: f.architecture,
            version: f.version,
            fileName: f.fileName,
            fileSize: BigInt(f.fileSize),
            formattedSize: f.formattedSize,
            fileHash: f.fileHash,
            storageKey: f.storageKey,
            isPrimary: f.isPrimary,
          })),
        },
        systemRequirements: {
          create: data.systemRequirements?.map((r) => ({
            platform: r.platform,
            reqType: r.reqType,
            os: r.os,
            processor: r.processor,
            memory: r.memory,
            graphics: r.graphics,
            storage: r.storage,
            directX: r.directX,
            network: r.network,
            additionalNotes: r.additionalNotes,
          })),
        },
      },
      include: {
        category: true,
        downloadFiles: true,
      },
    });

    return NextResponse.json(
      { message: 'Software item created successfully', item: serializeData(created) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating software item:', error);
    return NextResponse.json({ error: 'Failed to create software item' }, { status: 500 });
  }
}
