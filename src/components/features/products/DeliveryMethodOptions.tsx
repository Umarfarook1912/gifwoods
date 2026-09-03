"use client";

import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { DELIVERY_COPY, DELIVERY_METHODS } from "@/constants/shipping";
import type { DeliveryEstimateResult, DeliveryMethod } from "@/types/shipping";

interface Props {
  estimate: DeliveryEstimateResult;
  selected: DeliveryMethod;
  onSelect: (method: DeliveryMethod) => void;
}

function EstimateDateLine({ date }: { date: string }) {
  return (
    <span className="mt-1 flex items-start gap-1.5 text-sm text-dark">
      <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
      <span>
        {DELIVERY_COPY.ESTIMATED_ON_OR_BEFORE}{" "}
        <span className="font-semibold">{date}</span>
      </span>
    </span>
  );
}

export function DeliveryMethodOptions({ estimate, selected, onSelect }: Props) {
  const { normal, fast } = estimate.options;

  return (
    <div className="space-y-2" role="radiogroup" aria-label={DELIVERY_COPY.CHOOSE_METHOD}>
      <p className="text-xs font-medium text-dark">{DELIVERY_COPY.CHOOSE_METHOD}</p>

      <button
        type="button"
        role="radio"
        aria-checked={selected === DELIVERY_METHODS.NORMAL}
        onClick={() => onSelect(DELIVERY_METHODS.NORMAL)}
        className={cn(
          "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
          selected === DELIVERY_METHODS.NORMAL
            ? "border-gold bg-gold/10"
            : "border-border bg-white hover:border-gold/40"
        )}
      >
        <span
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 rounded-full border-2",
            selected === DELIVERY_METHODS.NORMAL
              ? "border-gold bg-gold"
              : "border-warm-gray"
          )}
        />
        <span className="min-w-0 flex-1">
          <span className="text-sm font-semibold text-dark">
            {DELIVERY_COPY.NORMAL_LABEL}
          </span>
          <EstimateDateLine date={normal.formattedDate} />
        </span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={selected === DELIVERY_METHODS.FAST}
        onClick={() => onSelect(DELIVERY_METHODS.FAST)}
        className={cn(
          "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
          selected === DELIVERY_METHODS.FAST
            ? "border-gold bg-gold/10"
            : "border-border bg-white hover:border-gold/40"
        )}
      >
        <span
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 rounded-full border-2",
            selected === DELIVERY_METHODS.FAST
              ? "border-gold bg-gold"
              : "border-warm-gray"
          )}
        />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-dark">
              {DELIVERY_COPY.FAST_LABEL}
            </span>
            <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-dark">
              {DELIVERY_COPY.FAST_FEE_NOTE}
            </span>
          </span>
          <EstimateDateLine date={fast.formattedDate} />
          <span className="mt-0.5 block text-xs text-warm-gray">
            {DELIVERY_COPY.FAST_FEE_HINT}
          </span>
        </span>
      </button>
    </div>
  );
}
