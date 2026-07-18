import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Props {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

const SIZE_CLASSES = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function StarRating({ rating, maxStars = 5, size = "md", interactive = false, onRate }: Props) {
  return (
    <div className="flex items-center gap-0.5" role={interactive ? "radiogroup" : undefined}>
      {Array.from({ length: maxStars }, (_, i) => {
        const value = i + 1;
        const filled = value <= rating;
        const half = !filled && value - 0.5 <= rating;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onRate?.(value)}
            aria-label={interactive ? `Rate ${value} star${value !== 1 ? "s" : ""}` : undefined}
            className={cn(
              "focus:outline-none",
              interactive && "cursor-pointer hover:scale-110 transition-transform"
            )}
          >
            <Star
              className={cn(
                SIZE_CLASSES[size],
                filled || half ? "fill-gold text-gold" : "text-muted-foreground/30",
                interactive && !filled && "hover:fill-gold hover:text-gold"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
