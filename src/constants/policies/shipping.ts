import type { PolicyDocument } from "@/types/support";

export const SHIPPING_POLICY: PolicyDocument = {
  title: "Shipping Policy",
  description:
    "Clear timelines, costs, and coverage details for every Gifwoods delivery across India.",
  lastUpdated: "November 25, 2026",
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
      paragraphs: [
        "Shipping is calculated per product and multiplied by quantity in your cart.",
      ],
      bullets: [
        "Normal delivery: each product’s shipping charge × quantity",
        "Fast delivery: (shipping charge + Fast surcharge) × quantity for each product",
        "Corporate bulk orders: shipping terms confirmed at quote time",
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
