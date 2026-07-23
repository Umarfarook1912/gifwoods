import type { PolicyDocument } from "@/types/support";
import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
} from "@/constants/ui";
import { formatPrice } from "@/lib/utils/formatters";

export const SHIPPING_POLICY: PolicyDocument = {
  title: "Shipping Policy",
  description:
    "Clear timelines, costs, and coverage details for every Gifwoods delivery across India.",
  lastUpdated: "January 1, 2026",
  sections: [
    {
      title: "Delivery Timelines",
      paragraphs: [
        "All Gifwoods orders are handcrafted with care. Please allow the following timelines:",
      ],
      bullets: [
        "Standard orders: 5–7 business days",
        "Personalized/engraved orders: 7–10 business days",
        "Corporate bulk orders (25+): 10–14 business days",
      ],
    },
    {
      title: "Shipping Costs",
      bullets: [
        `Orders of ${formatPrice(FREE_SHIPPING_THRESHOLD)} or more: Free shipping`,
        `Orders below ${formatPrice(FREE_SHIPPING_THRESHOLD)}: ${formatPrice(STANDARD_SHIPPING_FEE)} flat fee`,
        "Corporate orders: Free shipping on all bulk orders",
      ],
    },
    {
      title: "Coverage",
      paragraphs: [
        "We ship across all major cities and towns in India via our trusted logistics partners. All shipments are insured against loss or damage during transit.",
      ],
    },
    {
      title: "Tracking",
      paragraphs: [
        "Once your order ships, you will receive a tracking link via email. You can also track your order from your account's Orders section.",
      ],
    },
    {
      title: "Packaging",
      paragraphs: [
        "Every order comes in our signature Gifwoods gift box with a satin ribbon and handwritten note — complimentary on all orders.",
      ],
    },
    {
      title: "International Shipping",
      paragraphs: [
        "We currently ship within India only. International shipping is coming soon.",
      ],
    },
    {
      title: "Delays",
      paragraphs: [
        "Gifwoods is not responsible for delays caused by force majeure events, natural disasters, or courier-side disruptions. We will communicate proactively in such cases.",
      ],
    },
  ],
};
