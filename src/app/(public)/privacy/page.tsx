import type { Metadata } from "next";
import { PolicyPage } from "@/components/shared/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Gifwoods collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <PolicyPage title="Privacy Policy" lastUpdated="January 1, 2026">
      <h2>1. Information We Collect</h2>
      <p>We collect information you provide directly to us when you create an account, place an order, or contact us. This includes your name, email address, phone number, and shipping address.</p>

      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Process and fulfil your orders</li>
        <li>Send order confirmations and shipping updates</li>
        <li>Respond to your inquiries and provide customer support</li>
        <li>Send promotional communications (with your consent)</li>
        <li>Improve our products and services</li>
      </ul>

      <h2>3. Information Sharing</h2>
      <p>We do not sell, trade, or otherwise transfer your personally identifiable information to third parties except to trusted service providers who assist us in operating our website, conducting our business, or servicing you, provided they agree to keep this information confidential.</p>

      <h2>4. Payment Security</h2>
      <p>All payment transactions are processed through Cashfree, a PCI-DSS compliant payment gateway. We do not store your credit card or payment details on our servers.</p>

      <h2>5. Cookies</h2>
      <p>We use cookies to enhance your experience, analyze site traffic, and personalize content. You can control cookie settings through your browser preferences.</p>

      <h2>6. Data Retention</h2>
      <p>We retain your personal information for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account at any time by contacting us.</p>

      <h2>7. Your Rights</h2>
      <p>You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at privacy@gifwoods.in.</p>

      <h2>8. Contact Us</h2>
      <p>If you have questions about this Privacy Policy, please contact us at <strong>privacy@gifwoods.in</strong>.</p>
    </PolicyPage>
  );
}
