import { NextRequest, NextResponse } from 'next/server';
import { prisma, serializeData } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const item = await prisma.softwareItem.findUnique({
      where: { slug },
      include: {
        category: true,
        screenshots: { orderBy: { orderIndex: 'asc' } },
        downloadFiles: { orderBy: { isPrimary: 'desc' } },
        systemRequirements: true,
        tags: { include: { tag: true } },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        savedByUsers: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
      },
    });

    if (!item || !item.isPublished) {
      return NextResponse.json({ error: 'Software item not found' }, { status: 404 });
    }

    // Increment view count asynchronously
    await prisma.softwareItem.update({
      where: { id: item.id },
      data: { viewCount: { increment: 1 } },
    });

    // Fetch related recommendations in same category
    const relatedItems = await prisma.softwareItem.findMany({
      where: {
        categoryId: item.categoryId,
        id: { not: item.id },
        isPublished: true,
      },
      include: {
        category: true,
        downloadFiles: true,
      },
      take: 4,
      orderBy: { downloadCount: 'desc' },
    });

    const isSaved = Boolean(item.savedByUsers && item.savedByUsers.length > 0);

    const serialized = serializeData({
      item: { ...item, isSaved },
      relatedItems,
    });

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error fetching software item details:', error);
    return NextResponse.json(
      { error: 'An error occurred while loading software details.' },
      { status: 500 }
    );
  }
}
