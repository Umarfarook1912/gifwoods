"use client";

import { CHECKOUT_STEPS } from "@/constants/checkout";
import { cn } from "@/lib/utils/cn";
import type { CheckoutStep } from "@/types/order";

interface Props {
  currentStep: CheckoutStep;
  onStepChange: (step: CheckoutStep) => void;
}

export function CheckoutStepper({ currentStep, onStepChange }: Props) {
  const currentIndex = CHECKOUT_STEPS.findIndex((step) => step.id === currentStep);

  return (
    <ol className="grid grid-cols-3 rounded-2xl border border-border bg-white p-2 shadow-sm">
      {CHECKOUT_STEPS.map((step, index) => {
        const complete = index < currentIndex;
        const active = index === currentIndex;
        const accessible = index <= currentIndex;

        return (
          <li key={step.id} className="relative">
            {index > 0 && (
              <span
                className={cn(
                  "absolute top-5 -left-1/2 h-px w-full",
                  index <= currentIndex ? "bg-gold" : "bg-border"
                )}
              />
            )}
            <button
              type="button"
              disabled={!accessible}
              onClick={() => accessible && onStepChange(step.id)}
              className={cn(
                "relative z-10 mx-auto flex w-full flex-col items-center gap-1.5 rounded-xl py-1.5 transition-colors",
                accessible && "cursor-pointer hover:bg-gold/5",
                !accessible && "cursor-not-allowed"
              )}
              aria-current={active ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold transition-all",
                  complete && "border-gold bg-gold text-dark",
                  active && "border-dark bg-dark text-white shadow-md",
                  !complete && !active && "border-border bg-cream text-warm-gray"
                )}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  "text-xs font-medium sm:text-sm",
                  active ? "text-dark" : "text-warm-gray"
                )}
              >
                {step.label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
