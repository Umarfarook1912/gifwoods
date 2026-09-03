"use client";

import { cn } from "@/lib/utils/cn";
import { DELIVERY_COPY, DELIVERY_METHODS, FAST_DELIVERY_FEE } from "@/constants/shipping";
import { formatPrice } from "@/lib/utils/formatters";
import type { DeliveryMethod } from "@/types/shipping";

interface Props {
  selected: DeliveryMethod;
  onSelect: (method: DeliveryMethod) => void;
  className?: string;
}

/** Compact Normal / Fast toggle for cart & checkout (dates shown on product page). */
export function ShippingMethodToggle({ selected, onSelect, className }: Props) {
  return (
    <div className={cn("space-y-2", className)} role="radiogroup" aria-label={DELIVERY_COPY.CHOOSE_METHOD}>
      <p className="text-xs font-medium text-dark">{DELIVERY_COPY.CHOOSE_METHOD}</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          role="radio"
          aria-checked={selected === DELIVERY_METHODS.NORMAL}
          onClick={() => onSelect(DELIVERY_METHODS.NORMAL)}
          className={cn(
            "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
            selected === DELIVERY_METHODS.NORMAL
              ? "border-gold bg-gold/10 font-semibold text-dark"
              : "border-border bg-white text-warm-gray hover:border-gold/40"
          )}
        >
          {DELIVERY_COPY.NORMAL_LABEL}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={selected === DELIVERY_METHODS.FAST}
          onClick={() => onSelect(DELIVERY_METHODS.FAST)}
          className={cn(
            "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
            selected === DELIVERY_METHODS.FAST
              ? "border-gold bg-gold/10 font-semibold text-dark"
              : "border-border bg-white text-warm-gray hover:border-gold/40"
          )}
        >
          <span className="block">{DELIVERY_COPY.FAST_LABEL}</span>
          <span className="mt-0.5 block text-[10px] font-bold uppercase text-gold">
            +{formatPrice(FAST_DELIVERY_FEE)}
          </span>
        </button>
      </div>
    </div>
  );
}
