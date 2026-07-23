"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FAQS } from "@/constants/faqs";

export function FaqsAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {FAQS.map((faq, index) => {
        const open = openIndex === index;
        const number = String(index + 1).padStart(2, "0");

        return (
          <div
            key={faq.q}
            className={cn(
              "relative overflow-hidden rounded-3xl border bg-white transition-all",
              open
                ? "border-gold/40 shadow-md ring-1 ring-gold/20"
                : "border-border shadow-sm hover:border-gold/30 hover:shadow-md"
            )}
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gold via-gold-light to-gold/40" />

            <button
              type="button"
              className="flex w-full items-start gap-4 px-5 py-5 text-left md:gap-5 md:px-6 md:py-6"
              onClick={() => setOpenIndex(open ? null : index)}
              aria-expanded={open}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gold/15 font-display text-xs font-bold text-gold-dark">
                {number}
              </span>
              <span className="flex-1 pt-2 text-sm font-semibold text-dark md:text-base">
                {faq.q}
              </span>
              <span
                className={cn(
                  "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors",
                  open
                    ? "border-gold/40 bg-gold/15 text-gold-dark"
                    : "border-border bg-cream text-warm-gray"
                )}
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    open && "rotate-180"
                  )}
                />
              </span>
            </button>

            {open && (
              <div className="border-t border-border/70 px-5 pb-5 pl-[4.25rem] md:px-6 md:pb-6 md:pl-[5.25rem]">
                <p className="text-[15px] leading-7 text-warm-gray md:text-base md:leading-8">
                  {faq.a}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
