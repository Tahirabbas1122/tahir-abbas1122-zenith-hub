import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, serializeData } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin privileges required' }, { status: 403 });
    }

    const [
      totalSoftware,
      totalDownloads,
      totalUsers,
      totalReviews,
      recentLogs,
      categories,
      allSoftware,
    ] = await Promise.all([
      prisma.softwareItem.count(),
      prisma.downloadLog.count(),
      prisma.user.count(),
      prisma.review.count(),
      prisma.downloadLog.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        include: {
          software: { select: { title: true, slug: true } },
          user: { select: { name: true, email: true } },
          downloadFile: { select: { fileName: true, formattedSize: true } },
        },
      }),
      prisma.category.findMany({
        include: { _count: { select: { items: true } } },
      }),
      prisma.softwareItem.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          downloadFiles: true,
        },
      }),
    ]);

    const stats = {
      totalSoftware,
      totalDownloads,
      totalUsers,
      totalReviews,
      categories,
      recentLogs,
      softwareList: allSoftware,
    };

    return NextResponse.json(serializeData(stats));
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
