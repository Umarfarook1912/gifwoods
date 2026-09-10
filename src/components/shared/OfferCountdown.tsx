"use client";

import { PRODUCT_OFFER_COPY } from "@/constants/offers";
import { useOfferCountdown } from "@/hooks/useOfferCountdown";
import { padCountdownUnit } from "@/lib/products/offer-countdown";
import { cn } from "@/lib/utils/cn";

interface Props {
  endsAt: string;
  className?: string;
  /** Compact chip for card overlays; inline chip for PDP price row. */
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
          "rounded-full border border-border bg-cream px-2.5 py-1 text-[10px] font-semibold text-warm-gray",
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
        "pointer-events-none inline-flex select-none items-center gap-1.5 rounded-full border border-gold/40 bg-cream",
        isOverlay ? "px-2 py-1" : "px-2.5 py-1.5",
        className
      )}
      role="timer"
      aria-live="polite"
      aria-label={aria}
    >
      <span
        className={cn(
          "font-semibold uppercase tracking-[0.14em] text-gold-dark",
          isOverlay ? "text-[8px]" : "text-[9px]"
        )}
      >
        {PRODUCT_OFFER_COPY.TIMER_LABEL}
      </span>
      <span
        className={cn(
          "font-display font-bold tabular-nums text-dark",
          isOverlay ? "text-[11px] leading-none" : "text-sm leading-none"
        )}
      >
        {clock}
      </span>
    </div>
  );
}
