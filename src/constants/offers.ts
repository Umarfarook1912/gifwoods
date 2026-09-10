import type { ProductOfferType } from "@/types/product";

export const PRODUCT_OFFER_TYPES = {
  PERCENT: "percent",
  AMOUNT: "amount",
} as const satisfies Record<string, ProductOfferType>;

export const PRODUCT_OFFER_TYPE_LABELS: Record<ProductOfferType, string> = {
  percent: "Percent off (%)",
  amount: "Flat amount off (₹)",
};

export const PRODUCT_OFFER_COPY = {
  SECTION_TITLE: "Offers",
  SECTION_SUBTITLE: "Limited-time deals on selected gifts — grab them before they end.",
  SECTION_BADGE: "Limited time",
  PAGE_TITLE: "Offers",
  PAGE_DESCRIPTION: "Limited-time deals on selected personalized gifts.",
  EMPTY_TITLE: "No active offers right now",
  EMPTY_CTA: "Browse all gifts",
  NAV_LABEL: "Offers",
  FORM_TYPE_LABEL: "Offer type",
  FORM_TYPE_NONE: "No offer",
  FORM_VALUE_LABEL: "Offer value",
  FORM_VALUE_PERCENT_HINT: "e.g. 20 for 20% off",
  FORM_VALUE_AMOUNT_HINT: "e.g. 100 for ₹100 off",
  FORM_START_LABEL: "Offer starts",
  FORM_END_LABEL: "Offer ends",
  FORM_SECTION_TITLE: "Timed offer",
  BADGE_PERCENT: (value: number) => `${Math.round(value)}% off`,
  BADGE_AMOUNT: (value: number) => `₹${Math.round(value)} off`,
  TIMER_LABEL: "Ends in",
  TIMER_ENDED: "Offer ended",
  TIMER_DAY: "D",
  TIMER_HOUR: "H",
  TIMER_MINUTE: "M",
  TIMER_SECOND: "S",
  TIMER_ARIA: (label: string) => `Offer ends in ${label}`,
} as const;

export const OFFER_COUNTDOWN_TICK_MS = 1000;

export const PRODUCT_OFFER_VALIDATION = {
  VALUE_REQUIRED: "Offer value is required when an offer type is set",
  PERCENT_MAX: "Percent off cannot exceed 100",
  AMOUNT_LT_PRICE: "Flat offer must be less than the product price",
  WINDOW_REQUIRED: "Offer start and end times are required",
  END_AFTER_START: "Offer end must be after start",
} as const;
