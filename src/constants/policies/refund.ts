import type { PolicyDocument } from "@/types/support";

export const REFUND_POLICY: PolicyDocument = {
  title: "Refund & Returns Policy",
  description:
    "When returns apply, how to request one, and how quickly refunds are processed.",
  lastUpdated: "January 1, 2026",
  sections: [
    {
      title: "Our Commitment",
      paragraphs: [
        "At Gifwoods, we stand behind the quality of every product. If something isn't right, we'll make it right.",
      ],
    },
    {
      title: "Eligible for Returns",
      bullets: [
        "Damaged or defective products on arrival",
        "Wrong product delivered",
        "Product significantly different from description",
      ],
    },
    {
      title: "Not Eligible for Returns",
      bullets: [
        "Personalized or customized items (unless defective)",
        "Opened consumable products (candles, food hampers)",
        "Items damaged due to misuse after delivery",
        "Orders returned after 7 days of delivery",
      ],
    },
    {
      title: "Return Process",
      numbered: [
        "Email us at returns@gifwoods.in within 7 days of delivery",
        "Include your order ID and photos of the issue",
        "Our team will review within 2 business days",
        "Approved returns will receive a prepaid return label",
      ],
    },
    {
      title: "Refund Timeline",
      paragraphs: [
        "Approved refunds are processed within 5–7 business days to your original payment method. Bank processing time may add 2–3 additional days.",
      ],
    },
    {
      title: "Exchanges",
      paragraphs: [
        "We offer exchanges on non-personalized products if requested within 7 days of delivery. Exchange shipping is complimentary for eligible items.",
      ],
    },
    {
      title: "Contact",
      paragraphs: [
        "For returns or refund queries, email returns@gifwoods.in or WhatsApp us at +91-99999-99999.",
      ],
    },
  ],
};
