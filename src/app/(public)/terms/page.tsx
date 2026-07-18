import type { Metadata } from "next";
import { PolicyPage } from "@/components/shared/PolicyPage";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using Gifwoods services.",
};

export default function TermsPage() {
  return (
    <PolicyPage title="Terms & Conditions" lastUpdated="January 1, 2026">
      <h2>1. Acceptance of Terms</h2>
      <p>By accessing and using the Gifwoods website and services, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>

      <h2>2. Products and Customization</h2>
      <p>All products on Gifwoods are handcrafted and may have slight variations from images shown. Customized and personalized orders are final and cannot be returned unless defective.</p>

      <h2>3. Orders and Payment</h2>
      <p>By placing an order, you warrant that you are authorized to use the payment method provided. All prices are in Indian Rupees (INR) and inclusive of applicable taxes.</p>

      <h2>4. Intellectual Property</h2>
      <p>All content on this website, including designs, logos, and product descriptions, is the property of Gifwoods and protected by applicable intellectual property laws.</p>

      <h2>5. Limitation of Liability</h2>
      <p>Gifwoods shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services beyond the purchase price paid.</p>

      <h2>6. Governing Law</h2>
      <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka.</p>

      <h2>7. Changes to Terms</h2>
      <p>We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the updated terms.</p>

      <h2>8. Contact</h2>
      <p>For questions regarding these terms, contact us at <strong>legal@gifwoods.in</strong>.</p>
    </PolicyPage>
  );
}
