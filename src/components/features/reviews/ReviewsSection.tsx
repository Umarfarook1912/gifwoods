import { Star } from "lucide-react";
import { ReviewCard } from "./ReviewCard";
import { Separator } from "@/components/ui/separator";
import type { Review } from "@/types/review";

interface Props {
  reviews: Review[];
  productId: string;
}

export function ReviewsSection({ reviews, productId }: Props) {
  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-dark mb-1">
            Customer Reviews
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-gold text-gold" />
              <span className="font-bold text-dark">{avg.toFixed(1)}</span>
              <span className="text-warm-gray text-sm">
                from {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {reviews.length === 0 ? (
        <p className="text-warm-gray py-8 text-center">
          No reviews yet. Be the first to review this gift!
        </p>
      ) : (
        <div>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </section>
  );
}
