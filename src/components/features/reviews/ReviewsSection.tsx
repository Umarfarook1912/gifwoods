"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Star, MessageSquare } from "lucide-react";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import type { Review } from "@/types/review";

interface Props {
  reviews: Review[];
  productId: string;
}

export function ReviewsSection({ reviews: initialReviews, productId }: Props) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [reviewsList, setReviewsList] = useState<Review[]>(initialReviews);

  const avg =
    reviewsList.length > 0
      ? reviewsList.reduce((s, r) => s + r.rating, 0) / reviewsList.length
      : 0;

  const handleRefresh = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}&isApproved=true`);
      const json = await res.json();
      if (json.data) setReviewsList(json.data);
    } catch (err) {
      console.error("Failed to refresh reviews:", err);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-dark mb-1">
          Customer Reviews
        </h2>
        {reviewsList.length > 0 ? (
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-gold text-gold" />
            <span className="font-bold text-dark">{avg.toFixed(1)}</span>
            <span className="text-warm-gray text-sm">
              from {reviewsList.length} review{reviewsList.length !== 1 ? "s" : ""}
            </span>
          </div>
        ) : (
          <p className="text-sm text-warm-gray">No reviews yet. Be the first to share your thoughts!</p>
        )}
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Reviews List */}
        <div className="md:col-span-2 space-y-2">
          {reviewsList.length === 0 ? (
            <div className="text-center py-10 bg-cream/30 rounded-2xl border border-border/50">
              <MessageSquare className="w-10 h-10 text-warm-gray/50 mx-auto mb-3" />
              <p className="text-warm-gray text-sm">No reviews yet. Buy this product or write a review below!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {reviewsList.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>

        {/* Write a Review Block */}
        <div className="md:col-span-1">
          <div className="bg-cream/40 p-6 rounded-2xl border border-border/60 sticky top-24">
            <h3 className="font-display font-bold text-lg text-dark mb-4">Write a Review</h3>
            {status === "loading" && (
              <div className="h-20 bg-muted animate-pulse rounded-xl" />
            )}
            {status === "unauthenticated" && (
              <div className="space-y-3">
                <p className="text-sm text-warm-gray leading-relaxed">
                  Only logged-in customers can leave reviews. Sign in to write a review for this gift.
                </p>
                <Button asChild className="w-full bg-gold hover:bg-gold-dark text-dark font-semibold">
                  <Link href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}>
                    Sign In to Review
                  </Link>
                </Button>
              </div>
            )}
            {status === "authenticated" && (
              <ReviewForm
                productId={productId}
                orderId={null}
                onSuccess={handleRefresh}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
