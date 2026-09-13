import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, serializeData } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const savedItems = await prisma.savedItem.findMany({
      where: { userId: session.user.id },
      include: {
        software: {
          include: {
            category: true,
            downloadFiles: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(serializeData(savedItems));
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch saved items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'You must be logged in to save items' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { softwareId } = body;

    if (!softwareId) {
      return NextResponse.json({ error: 'Software ID is required' }, { status: 400 });
    }

    const existing = await prisma.savedItem.findUnique({
      where: {
        userId_softwareId: { userId, softwareId },
      },
    });

    if (existing) {
      // Remove from wishlist
      await prisma.savedItem.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ saved: false, message: 'Removed from saved items' });
    } else {
      // Add to wishlist
      await prisma.savedItem.create({
        data: { userId, softwareId },
      });
      return NextResponse.json({ saved: true, message: 'Added to saved items' });
    }
  } catch (error) {
    console.error('Error toggling saved item:', error);
    return NextResponse.json({ error: 'Failed to update saved item' }, { status: 500 });
  }
}
