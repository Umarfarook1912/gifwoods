import type { CheckoutStep } from "@/types/order";

export const CHECKOUT_STEPS: Array<{
  id: CheckoutStep;
  label: string;
}> = [
  { id: "address", label: "Delivery" },
  { id: "review", label: "Review" },
  { id: "payment", label: "Payment" },
];

export const CHECKOUT_COPY = {
  TITLE: "Complete your order",
  SUBTITLE: "A few quick steps and your thoughtful gift will be on its way.",
  ADDRESS_TITLE: "Where should we deliver?",
  REVIEW_TITLE: "Review your order",
  PAYMENT_TITLE: "Complete payment",
  PAY_SECURELY: "Pay securely",
} as const;
