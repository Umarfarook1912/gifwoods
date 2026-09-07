import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/shared/StarRating";
import { formatDate } from "@/lib/utils/formatters";
import { REVIEW_COPY } from "@/constants/reviews";
import { cn } from "@/lib/utils/cn";
import type { Review } from "@/types/review";

interface Props {
  review: Review;
}

/** Shows the signed-in customer's own review and its approval status. */
export function MyReviewStatus({ review }: Props) {
  const pending = !review.is_approved;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display font-bold text-lg text-dark">
          {REVIEW_COPY.YOUR_REVIEW_TITLE}
        </h3>
        <Badge
          className={cn(
            "text-xs font-medium border",
            pending
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          )}
        >
          {pending ? REVIEW_COPY.STATUS_PENDING : REVIEW_COPY.STATUS_APPROVED}
        </Badge>
      </div>
      <p className="text-xs text-warm-gray leading-relaxed">
        {pending ? REVIEW_COPY.PENDING_HINT : REVIEW_COPY.APPROVED_HINT}
      </p>
      <div className="rounded-xl border border-border bg-white p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-xs text-muted-foreground">
            {formatDate(review.created_at)}
          </span>
        </div>
        <p className="text-sm text-secondary-dark leading-relaxed">{review.comment}</p>
        {review.admin_reply && (
          <div className="mt-2 border-l-2 border-gold bg-cream/70 p-3 rounded-r-lg text-xs">
            <p className="font-semibold text-dark mb-1">Response from Gifwoods:</p>
            <p className="text-secondary-dark/90 leading-relaxed">{review.admin_reply}</p>
          </div>
        )}
      </div>
    </div>
  );
}
