"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";
import { fetchVendorReviews } from "@/lib/reviews";
import type { Review } from "@/types/review";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

interface VendorReviewsSectionProps {
  vendorId: string;
  tenantId: string;
  averageRating?: number | null;
  reviewCount?: number | null;
  showTitle?: boolean;
  inCard?: boolean;
}

const STAR_LEVELS = [5, 4, 3, 2, 1] as const;

function formatReviewDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    return "Aujourd'hui";
  }
  if (diffDays < 30) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `Il y a ${diffMonths} mois`;
  }

  const diffYears = Math.floor(diffMonths / 12);
  return `Il y a ${diffYears} an${diffYears > 1 ? "s" : ""}`;
}

function getReviewerName(review: Review): string {
  if (review.user) {
    return `${review.user.firstName} ${review.user.lastName}`.trim();
  }

  return "Client";
}

function getReviewerInitial(review: Review): string {
  const name = getReviewerName(review);
  return name.charAt(0).toUpperCase();
}

function getStarCounts(reviews: Review[]): Record<number, number> {
  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  for (const review of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(review.rate)));
    counts[star] += 1;
  }

  return counts;
}

function StarRow({
  stars,
  count,
  total,
}: {
  stars: number;
  count: number;
  total: number;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-sm text-black">{stars} étoiles</span>
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-black transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-12 shrink-0 text-right text-sm text-black/70">
        ({count})
      </span>
    </div>
  );
}

function ReviewStars({ rate, size = 14 }: { rate: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <CategoryIcon
          key={index}
          icon={index < rate ? "Ionicons/star" : "Ionicons/star-outline"}
          size={size}
          color={TEXT_COLOR}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="overflow-hidden rounded-xl border border-black/10 bg-white">
      <div className="flex items-center gap-3 px-5 py-4">
        {review.user?.photoUrl ? (
          <Image
            src={review.user.photoUrl}
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-700 text-base font-bold text-white">
            {getReviewerInitial(review)}
          </span>
        )}
        <p className="text-base font-bold text-black">{getReviewerName(review)}</p>
      </div>

      <div className="border-t border-black/10" />

      <div className="px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <ReviewStars rate={review.rate} />
          <span className="text-sm font-bold text-black">{review.rate}</span>
          <span className="text-black/40">·</span>
          <span className="text-sm text-black/60">
            {formatReviewDate(review.createdAt)}
          </span>
        </div>

        {review.comment ? (
          <p className="mt-3 text-sm leading-relaxed text-black">
            {review.comment}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export default function VendorReviewsSection({
  vendorId,
  tenantId,
  averageRating,
  reviewCount,
  showTitle = true,
  inCard = false,
}: VendorReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadReviews() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchVendorReviews({ tenantId, vendorId });
        if (!isMounted) {
          return;
        }

        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setReviews(sorted);
      } catch (loadError: unknown) {
        if (!isMounted) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger les avis.";
        setError(message);
        setReviews([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [tenantId, vendorId]);

  const starCounts = useMemo(() => getStarCounts(reviews), [reviews]);

  const fallbackAverage =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + review.rate, 0) / reviews.length
      : 0;
  const rating = averageRating ?? fallbackAverage;
  const total = reviewCount ?? reviews.length;

  const content = (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        {showTitle ? (
          <h2 className="text-2xl font-bold text-black">Avis</h2>
        ) : (
          <div />
        )}

        <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
          <p className="text-sm text-black/70">{total} avis</p>
          <div className="flex items-center gap-2">
            <ReviewStars rate={Math.round(rating)} size={16} />
            <span className="text-lg font-bold text-black">
              {rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-black/70">Chargement des avis...</p>
      ) : null}

      {error ? (
        <p className="text-sm text-black/70">{error}</p>
      ) : null}

      {!isLoading && !error && reviews.length === 0 ? (
        <p className="text-sm text-black/70">Aucun avis pour le moment.</p>
      ) : null}

      {!isLoading && !error && reviews.length > 0 ? (
        <>
          <div className="mb-8 flex flex-col gap-2.5">
            {STAR_LEVELS.map((stars) => (
              <StarRow
                key={stars}
                stars={stars}
                count={starCounts[stars]}
                total={reviews.length}
              />
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </>
      ) : null}
    </>
  );

  if (inCard) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        {content}
      </section>
    );
  }

  return <section className={showTitle ? "py-5" : "py-0"}>{content}</section>;
}
