import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, serializeData } from '@/lib/prisma';
import { reviewSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'You must be logged in to submit a review' }, { status: 401 });
    }

    const userId = session.user.id;
    const rateCheck = checkRateLimit(`review:${userId}`, { limit: 10, windowMs: 60000 });
    if (!rateCheck.success) {
      return NextResponse.json({ error: 'Too many review submissions. Please wait.' }, { status: 429 });
    }

    const body = await req.json();
    const parseResult = reviewSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid review data' },
        { status: 400 }
      );
    }

    const { softwareId, rating, title, comment } = parseResult.data;

    // Check if user has downloaded this software (verified download badge)
    const hasDownloaded = await prisma.downloadLog.findFirst({
      where: {
        userId,
        softwareId,
        status: 'COMPLETED',
      },
    });

    const isVerifiedDownload = Boolean(hasDownloaded);

    // Check if user already submitted a review for this software
    const existingReview = await prisma.review.findFirst({
      where: { userId, softwareId },
    });

    let review;
    if (existingReview) {
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          title,
          comment,
          isVerifiedDownload,
        },
      });
    } else {
      review = await prisma.review.create({
        data: {
          userId,
          softwareId,
          rating,
          title,
          comment,
          isVerifiedDownload,
          isApproved: true,
        },
      });
    }

    // Recompute average rating and rating count
    const allApprovedReviews = await prisma.review.findMany({
      where: { softwareId, isApproved: true },
      select: { rating: true },
    });

    const ratingCount = allApprovedReviews.length;
    const averageRating =
      ratingCount > 0
        ? allApprovedReviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount
        : rating;

    await prisma.softwareItem.update({
      where: { id: softwareId },
      data: {
        ratingCount,
        averageRating: parseFloat(averageRating.toFixed(2)),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review: serializeData(review),
      averageRating,
      ratingCount,
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting your review.' },
      { status: 500 }
    );
  }
}
