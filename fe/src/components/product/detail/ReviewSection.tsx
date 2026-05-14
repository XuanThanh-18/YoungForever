"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, ThumbsUp, BadgeCheck } from "lucide-react";
import { reviewApi } from "@/lib/api";
import type { ReviewResponse } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  productId: string;
  avgRating: number;
  reviewCount: number;
}
const ratingPercent: Record<number, number> = {
  5: 80,
  4: 60,
  3: 30,
  2: 10,
  1: 5,
};
function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-stone-200 fill-stone-200"
          }
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewResponse }) {
  const initials = review.userFullName
    .split(" ")
    .map((n) => n[0])
    .slice(-2)
    .join("")
    .toUpperCase();

  const date = new Date(review.createdAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="py-6 border-b border-stone-100 last:border-0">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {review.userAvatarUrl ? (
            <img
              src={review.userAvatarUrl}
              alt={review.userFullName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
              <span className="text-xs font-bold text-rose-600">
                {initials}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-stone-800">
                {review.userFullName}
              </span>
              {review.isVerified && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                  <BadgeCheck size={11} />
                  Đã mua hàng
                </span>
              )}
            </div>
            <span className="text-xs text-stone-400 flex-shrink-0">{date}</span>
          </div>

          {/* Stars */}
          <div className="mb-2">
            <StarDisplay rating={review.rating} size={13} />
          </div>

          {/* Title */}
          {review.title && (
            <p className="text-sm font-semibold text-stone-800 mb-1">
              {review.title}
            </p>
          )}

          {/* Comment */}
          {review.comment && (
            <p className="text-sm text-stone-600 leading-relaxed">
              {review.comment}
            </p>
          )}

          {/* Images */}
          {review.imageUrls && review.imageUrls.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {review.imageUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Review image ${i + 1}`}
                  className="w-16 h-16 rounded-lg object-cover border border-stone-100"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReviewSection({
  productId,
  avgRating,
  reviewCount,
}: Props) {
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 5;

  const { data, isLoading } = useQuery({
    queryKey: ["reviews", productId, page],
    queryFn: async () => {
      const { data } = await reviewApi.getProductReviews(
        productId,
        page,
        PAGE_SIZE,
      );
      return data.data;
    },
    staleTime: 60_000,
  });

  const reviews = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  // Rating breakdown (5 → 1)
  const ratingBars = [5, 4, 3, 2, 1];

  return (
    <div>
      {/* Summary */}
      {reviewCount > 0 && (
        <div className="flex items-center gap-8 mb-8 p-6 bg-stone-50 rounded-2xl">
          {/* Overall score */}
          <div className="text-center flex-shrink-0">
            <p className="text-5xl font-bold text-stone-900">
              {avgRating.toFixed(1)}
            </p>
            <StarDisplay rating={avgRating} size={16} />
            <p className="text-xs text-stone-400 mt-1">
              {reviewCount} đánh giá
            </p>
          </div>

          {/* Bar chart */}
          <div className="flex-1 space-y-1.5">
            {ratingBars.map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-stone-500 w-3 flex-shrink-0">
                  {star}
                </span>
                <Star
                  size={10}
                  className="text-amber-400 fill-amber-400 flex-shrink-0"
                />
                <div className="flex-1 bg-stone-200 rounded-full h-1.5 overflow-hidden">
                  {/* In a real app, pass rating distribution from API */}
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{
                      width: `${ratingPercent[star]}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse py-6 border-b border-stone-100"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-stone-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-stone-100 rounded w-1/4" />
                  <div className="h-3 bg-stone-100 rounded w-full" />
                  <div className="h-3 bg-stone-100 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <Star
            size={40}
            strokeWidth={1}
            className="mx-auto mb-3 text-stone-200"
          />
          <p className="text-sm font-medium text-stone-500">
            Chưa có đánh giá nào
          </p>
          <p className="text-xs mt-1">
            Hãy là người đầu tiên đánh giá sản phẩm này!
          </p>
        </div>
      ) : (
        <>
          <div>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 text-sm border border-stone-200 rounded-xl hover:border-rose-300 hover:text-rose-600 disabled:opacity-40 transition-colors"
              >
                Trước
              </button>
              <span className="text-sm text-stone-500">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 text-sm border border-stone-200 rounded-xl hover:border-rose-300 hover:text-rose-600 disabled:opacity-40 transition-colors"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
