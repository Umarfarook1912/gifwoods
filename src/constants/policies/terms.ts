import type { PolicyDocument } from "@/types/support";

export const TERMS_POLICY: PolicyDocument = {
  title: "Terms & Conditions",
  description:
    "The rules that guide how you use Gifwoods — from ordering personalized gifts to payments and liability.",
  lastUpdated: "January 1, 2026",
  sections: [
    {
      title: "Acceptance of Terms",
      paragraphs: [
        "By accessing and using the Gifwoods website and services, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.",
      ],
    },
    {
      title: "Products and Customization",
      paragraphs: [
        "All products on Gifwoods are handcrafted and may have slight variations from images shown. Customized and personalized orders are final and cannot be returned unless defective.",
      ],
    },
    {
      title: "Orders and Payment",
      paragraphs: [
        "By placing an order, you warrant that you are authorized to use the payment method provided. All prices are in Indian Rupees (INR) and inclusive of applicable taxes.",
      ],
    },
    {
      title: "Intellectual Property",
      paragraphs: [
        "All content on this website, including designs, logos, and product descriptions, is the property of Gifwoods and protected by applicable intellectual property laws.",
      ],
    },
    {
      title: "Limitation of Liability",
      paragraphs: [
        "Gifwoods shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services beyond the purchase price paid.",
      ],
    },
    {
      title: "Governing Law",
      paragraphs: [
        "These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka.",
      ],
    },
    {
      title: "Changes to Terms",
      paragraphs: [
        "We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the updated terms.",
      ],
    },
    {
      title: "Contact",
      paragraphs: [
        "For questions regarding these terms, contact us at legal@gifwoods.in.",
      ],
    },
  ],
};
