import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/shared/StarRating";
import { formatDate } from "@/lib/utils/formatters";
import type { Review } from "@/types/review";

interface Props {
  review: Review;
}

export function ReviewCard({ review }: Props) {
  const user = review.user;
  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "GW";

  return (
    <div className="py-6 border-b border-border last:border-0">
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={user?.avatar_url ?? undefined} />
          <AvatarFallback className="bg-gold/10 text-gold text-xs font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-dark text-sm">{user?.name ?? "Customer"}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
          </div>
          <StarRating rating={review.rating} size="sm" />
          <p className="text-sm text-secondary-dark leading-relaxed mt-2">{review.comment}</p>
          {review.admin_reply && (
            <div className="mt-3 bg-cream/70 border-l-2 border-gold p-3 rounded-r-lg text-xs">
              <p className="font-semibold text-dark mb-1">Response from Gifwoods:</p>
              <p className="text-secondary-dark/90 leading-relaxed">{review.admin_reply}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
