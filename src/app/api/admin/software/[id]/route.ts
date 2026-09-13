import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, serializeData } from '@/lib/prisma';
import { softwareItemSchema } from '@/lib/validations';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = softwareItemSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid payload' },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Check slug collision with other items
    const existingSlug = await prisma.softwareItem.findFirst({
      where: {
        slug: data.slug,
        id: { not: id },
      },
    });

    if (existingSlug) {
      return NextResponse.json({ error: 'Another item with this slug already exists.' }, { status: 409 });
    }

    // Update item
    const updated = await prisma.softwareItem.update({
      where: { id },
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
      },
      include: {
        category: true,
        downloadFiles: true,
      },
    });

    return NextResponse.json({ message: 'Software updated successfully', item: serializeData(updated) });
  } catch (error) {
    console.error('Error updating software item:', error);
    return NextResponse.json({ error: 'Failed to update software item' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.softwareItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Software item deleted successfully' });
  } catch (error) {
    console.error('Error deleting software item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
