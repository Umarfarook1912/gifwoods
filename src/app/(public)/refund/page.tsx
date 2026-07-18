import type { Metadata } from "next";
import { PolicyPage } from "@/components/shared/PolicyPage";

export const metadata: Metadata = {
  title: "Refund & Returns Policy",
  description: "Gifwoods refund, return, and exchange policy.",
};

export default function RefundPage() {
  return (
    <PolicyPage title="Refund & Returns Policy" lastUpdated="January 1, 2026">
      <h2>Our Commitment</h2>
      <p>At Gifwoods, we stand behind the quality of every product. If something isn't right, we'll make it right.</p>

      <h2>Eligible for Returns</h2>
      <ul>
        <li>Damaged or defective products on arrival</li>
        <li>Wrong product delivered</li>
        <li>Product significantly different from description</li>
      </ul>

      <h2>Not Eligible for Returns</h2>
      <ul>
        <li>Personalized or customized items (unless defective)</li>
        <li>Opened consumable products (candles, food hampers)</li>
        <li>Items damaged due to misuse after delivery</li>
        <li>Orders returned after 7 days of delivery</li>
      </ul>

      <h2>Return Process</h2>
      <ol>
        <li>Email us at returns@gifwoods.in within 7 days of delivery</li>
        <li>Include your order ID and photos of the issue</li>
        <li>Our team will review within 2 business days</li>
        <li>Approved returns will receive a prepaid return label</li>
      </ol>

      <h2>Refund Timeline</h2>
      <p>Approved refunds are processed within 5–7 business days to your original payment method. Bank processing time may add 2–3 additional days.</p>

      <h2>Exchanges</h2>
      <p>We offer exchanges on non-personalized products if requested within 7 days of delivery. Exchange shipping is complimentary for eligible items.</p>

      <h2>Contact</h2>
      <p>For returns or refund queries, email <strong>returns@gifwoods.in</strong> or WhatsApp us at +91-99999-99999.</p>
    </PolicyPage>
  );
}
