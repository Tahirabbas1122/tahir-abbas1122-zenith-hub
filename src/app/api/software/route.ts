import { NextRequest, NextResponse } from 'next/server';
import { prisma, serializeData } from '@/lib/prisma';
import { searchParamsSchema } from '@/lib/validations';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const rawParams = {
      q: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      platform: searchParams.get('platform') || undefined,
      license: searchParams.get('license') || undefined,
      tag: searchParams.get('tag') || undefined,
      minRating: searchParams.get('minRating') || undefined,
      maxSizeMB: searchParams.get('maxSizeMB') || undefined,
      sort: searchParams.get('sort') || 'popular',
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 12,
    };

    const parsed = searchParamsSchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { q, category, platform, license, tag, minRating, maxSizeMB, sort, page, limit } = parsed.data;

    const where: Record<string, unknown> = {
      isPublished: true,
    };

    // Category filter (slug or ID)
    if (category && category !== 'all') {
      where.OR = [
        { category: { slug: category } },
        { categoryId: category },
      ];
    }

    // License filter
    if (license && license !== 'all') {
      where.license = license.toUpperCase();
    }

    // Minimum Rating filter
    if (minRating && minRating > 0) {
      where.averageRating = { gte: minRating };
    }

    // Platform filter
    if (platform && platform !== 'all') {
      where.downloadFiles = {
        some: {
          platform: platform.toUpperCase(),
        },
      };
    }

    // Tag filter
    if (tag && tag !== 'all') {
      where.tags = {
        some: {
          tag: {
            slug: tag.toLowerCase(),
          },
        },
      };
    }

    // Full-Text Search / Keyword query
    if (q && q.trim().length > 0) {
      const cleanQ = q.trim();
      where.AND = [
        {
          OR: [
            { title: { contains: cleanQ } },
            { tagline: { contains: cleanQ } },
            { description: { contains: cleanQ } },
            { developer: { contains: cleanQ } },
          ],
        },
      ];
    }

    // Sorting
    let orderBy: Record<string, string> | Record<string, string>[] = { downloadCount: 'desc' };
    if (sort === 'newest') {
      orderBy = { releaseDate: 'desc' };
    } else if (sort === 'rating') {
      orderBy = { averageRating: 'desc' };
    } else if (sort === 'name') {
      orderBy = { title: 'asc' };
    }

    const skip = (page - 1) * limit;

    const [totalCount, items, categories, tags] = await Promise.all([
      prisma.softwareItem.count({ where }),
      prisma.softwareItem.findMany({
        where,
        include: {
          category: true,
          downloadFiles: true,
          tags: {
            include: { tag: true },
          },
          savedByUsers: userId
            ? {
                where: { userId },
                select: { id: true },
              }
            : false,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.category.findMany({
        orderBy: { orderIndex: 'asc' },
        include: { _count: { select: { items: true } } },
      }),
      prisma.tag.findMany({
        orderBy: { name: 'asc' },
      }),
    ]);

    // Format items with `isSaved` boolean
    let formattedItems = items.map((item) => ({
      ...item,
      isSaved: Boolean(item.savedByUsers && item.savedByUsers.length > 0),
    }));

    // Filter by max size in MB if requested
    if (maxSizeMB) {
      const maxBytes = BigInt(maxSizeMB * 1024 * 1024);
      formattedItems = formattedItems.filter((item) =>
        item.downloadFiles.some((f) => f.fileSize <= maxBytes)
      );
    }

    const serialized = serializeData({
      items: formattedItems,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
      },
      categories,
      tags,
    });

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error fetching software catalog:', error);
    return NextResponse.json(
      { error: 'An error occurred while querying the software catalog.' },
      { status: 500 }
    );
  }
}
