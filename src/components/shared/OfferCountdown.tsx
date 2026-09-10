"use client";

import { PRODUCT_OFFER_COPY } from "@/constants/offers";
import { useOfferCountdown } from "@/hooks/useOfferCountdown";
import { padCountdownUnit } from "@/lib/products/offer-countdown";
import { cn } from "@/lib/utils/cn";

interface Props {
  endsAt: string;
  className?: string;
  /** Compact chip for card overlays; larger strip for PDP. */
  variant?: "overlay" | "detail";
}

function formatClock(parts: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}): string {
  const clock = `${padCountdownUnit(parts.hours)}:${padCountdownUnit(parts.minutes)}:${padCountdownUnit(parts.seconds)}`;
  return parts.days > 0 ? `${parts.days}d ${clock}` : clock;
}

export function OfferCountdown({ endsAt, className, variant = "overlay" }: Props) {
  const parts = useOfferCountdown(endsAt);

  if (!parts) return null;

  if (parts.expired) {
    return (
      <p
        className={cn(
          "rounded-md bg-dark/80 px-2 py-1 text-[10px] font-semibold text-cream",
          className
        )}
      >
        {PRODUCT_OFFER_COPY.TIMER_ENDED}
      </p>
    );
  }

  const clock = formatClock(parts);
  const aria = PRODUCT_OFFER_COPY.TIMER_ARIA(clock);
  const isOverlay = variant === "overlay";

  return (
    <div
      className={cn(
        "pointer-events-none select-none overflow-hidden border border-gold/50",
        isOverlay
          ? "rounded-md bg-dark/90 px-2 py-1 shadow-sm backdrop-blur-sm"
          : "inline-flex shrink-0 items-center rounded-lg bg-dark px-3 py-2",
        className
      )}
      role="timer"
      aria-live="polite"
      aria-label={aria}
    >
      <div className={cn("flex", isOverlay ? "flex-col gap-0.5" : "items-baseline gap-2")}>
        <span
          className={cn(
            "font-semibold uppercase tracking-[0.18em] text-gold",
            isOverlay ? "text-[8px] leading-none" : "text-[9px]"
          )}
        >
          {PRODUCT_OFFER_COPY.TIMER_LABEL}
        </span>
        <span
          className={cn(
            "font-display font-bold tabular-nums tracking-wide text-cream",
            isOverlay ? "text-[11px] leading-none sm:text-xs" : "text-sm sm:text-base"
          )}
        >
          {clock}
        </span>
      </div>
    </div>
  );
}
