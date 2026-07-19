import type { Metadata } from "next";
import { PolicyPage } from "@/components/shared/PolicyPage";
import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
} from "@/constants/ui";
import { formatPrice } from "@/lib/utils/formatters";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Learn about Gifwoods shipping timelines, costs, and coverage.",
};

export default function ShippingPage() {
  return (
    <PolicyPage title="Shipping Policy" lastUpdated="January 1, 2026">
      <h2>Delivery Timelines</h2>
      <p>All Gifwoods orders are handcrafted with care. Please allow the following timelines:</p>
      <ul>
        <li><strong>Standard orders:</strong> 5–7 business days</li>
        <li><strong>Personalized/engraved orders:</strong> 7–10 business days</li>
        <li><strong>Corporate bulk orders (25+):</strong> 10–14 business days</li>
      </ul>

      <h2>Shipping Costs</h2>
      <ul>
        <li>
          Orders of {formatPrice(FREE_SHIPPING_THRESHOLD)} or more:{" "}
          <strong>Free shipping</strong>
        </li>
        <li>
          Orders below {formatPrice(FREE_SHIPPING_THRESHOLD)}:{" "}
          {formatPrice(STANDARD_SHIPPING_FEE)} flat fee
        </li>
        <li>Corporate orders: Free shipping on all bulk orders</li>
      </ul>

      <h2>Coverage</h2>
      <p>We ship across all major cities and towns in India via our trusted logistics partners. All shipments are insured against loss or damage during transit.</p>

      <h2>Tracking</h2>
      <p>Once your order ships, you will receive a tracking link via email. You can also track your order from your account's Orders section.</p>

      <h2>Packaging</h2>
      <p>Every order comes in our signature Gifwoods gift box with a satin ribbon and handwritten note — complimentary on all orders.</p>

      <h2>International Shipping</h2>
      <p>We currently ship within India only. International shipping is coming soon.</p>

      <h2>Delays</h2>
      <p>Gifwoods is not responsible for delays caused by force majeure events, natural disasters, or courier-side disruptions. We will communicate proactively in such cases.</p>
    </PolicyPage>
  );
}
