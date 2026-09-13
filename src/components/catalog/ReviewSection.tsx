'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ReviewData } from '@/types';
import { Star, ShieldCheck, ThumbsUp, MessageSquarePlus, X, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ReviewSectionProps {
  softwareId: string;
  initialReviews: ReviewData[];
  averageRating: number;
  ratingCount: number;
}

export function ReviewSection({
  softwareId,
  initialReviews,
  averageRating,
  ratingCount,
}: ReviewSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<ReviewData[]>(initialReviews || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      alert('Please sign in to post a review');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          softwareId,
          rating,
          title,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      // Add new review to top of list
      const newReview: ReviewData = {
        ...data.review,
        user: {
          id: session.user.id,
          name: session.user.name,
          image: session.user.image,
        },
      };

      setReviews((prev) => [newReview, ...prev.filter((r) => r.id !== newReview.id)]);
      setIsModalOpen(false);
      setTitle('');
      setComment('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit review';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Rating Breakdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 min-w-[90px]">
            <span className="text-2xl font-black text-amber-400">{averageRating.toFixed(1)}</span>
            <div className="flex text-amber-400 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-3 w-3 ${
                    s <= Math.round(averageRating) ? 'fill-amber-400' : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">{ratingCount} reviews</span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">Community Ratings & Feedback</h3>
            <p className="text-xs text-slate-400">
              Verified community downloads and software benchmarks.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (!session) {
              alert('Please sign in to write a review');
              return;
            }
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md hover:from-cyan-400 hover:to-indigo-500 transition-all self-start sm:self-auto"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-8 text-center text-xs text-slate-400">
          No reviews yet. Be the first to try and share your review!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 space-y-2.5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-xs font-bold text-slate-950">
                    {rev.user?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-white">{rev.user?.name || 'User'}</h5>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{formatDate(rev.createdAt)}</span>
                      {rev.isVerifiedDownload && (
                        <span className="flex items-center gap-0.5 text-cyan-400 font-medium">
                          <ShieldCheck className="h-3 w-3" /> Verified Download
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${
                        s <= rev.rating ? 'fill-amber-400' : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <h4 className="font-bold text-xs text-slate-200">{rev.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-150"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquarePlus className="h-4 w-4 text-cyan-400" /> Submit Your Review
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {submitError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Your Rating</label>
                <div className="flex items-center gap-1 text-slate-600">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Review Headline</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Blazing fast startup, flawless Linux support!"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Detailed Review</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell other developers and gamers about performance, installation, usability..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Publish Review'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
