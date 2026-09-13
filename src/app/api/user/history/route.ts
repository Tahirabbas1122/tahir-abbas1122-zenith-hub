import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, serializeData } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const downloadLogs = await prisma.downloadLog.findMany({
      where: { userId },
      include: {
        software: {
          select: {
            id: true,
            title: true,
            slug: true,
            iconUrl: true,
            version: true,
            category: {
              select: { name: true, slug: true },
            },
          },
        },
        downloadFile: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(serializeData(downloadLogs));
  } catch (error) {
    console.error('Error fetching user download history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch download history' },
      { status: 500 }
    );
  }
}
