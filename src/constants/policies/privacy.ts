import type { PolicyDocument } from "@/types/support";

export const PRIVACY_POLICY: PolicyDocument = {
  title: "Privacy Policy",
  description:
    "How we collect, use, and protect your personal information when you shop with Gifwoods.",
  lastUpdated: "January 1, 2026",
  sections: [
    {
      title: "Information We Collect",
      paragraphs: [
        "We collect information you provide directly to us when you create an account, place an order, or contact us. This includes your name, email address, phone number, and shipping address.",
      ],
    },
    {
      title: "How We Use Your Information",
      paragraphs: ["We use the information we collect to:"],
      bullets: [
        "Process and fulfil your orders",
        "Send order confirmations and shipping updates",
        "Respond to your inquiries and provide customer support",
        "Send promotional communications (with your consent)",
        "Improve our products and services",
      ],
    },
    {
      title: "Information Sharing",
      paragraphs: [
        "We do not sell, trade, or otherwise transfer your personally identifiable information to third parties except to trusted service providers who assist us in operating our website, conducting our business, or servicing you, provided they agree to keep this information confidential.",
      ],
    },
    {
      title: "Payment Security",
      paragraphs: [
        "All payment transactions are processed through Cashfree, a PCI-DSS compliant payment gateway. We do not store your credit card or payment details on our servers.",
      ],
    },
    {
      title: "Cookies",
      paragraphs: [
        "We use cookies to enhance your experience, analyze site traffic, and personalize content. You can control cookie settings through your browser preferences.",
      ],
    },
    {
      title: "Data Retention",
      paragraphs: [
        "We retain your personal information for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account at any time by contacting us.",
      ],
    },
    {
      title: "Your Rights",
      paragraphs: [
        "You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at privacy@gifwoods.in.",
      ],
    },
    {
      title: "Contact Us",
      paragraphs: [
        "If you have questions about this Privacy Policy, please contact us at privacy@gifwoods.in.",
      ],
    },
  ],
};
