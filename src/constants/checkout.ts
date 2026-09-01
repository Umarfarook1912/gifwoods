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
  REMOVE_ITEM: "Remove item",
  DECREASE_QTY: "Decrease quantity",
  INCREASE_QTY: "Increase quantity",
} as const;

export const PAYMENT_RETURN_TOAST = {
  SUCCESS: "Payment successful",
  SUCCESS_DESCRIPTION: "Your order is confirmed. A receipt has been sent to your email.",
  PENDING: "Payment processing",
  PENDING_DESCRIPTION: "We’re confirming your payment. Order status will update shortly.",
  VERIFICATION_FAILED: "Payment verification pending",
  VERIFICATION_FAILED_DESCRIPTION:
    "We could not verify the payment yet. Please check your orders again shortly.",
  STORAGE_KEY_PREFIX: "gifwoods:payment-toast:",
  DURATION_MS: 3000,
} as const;
