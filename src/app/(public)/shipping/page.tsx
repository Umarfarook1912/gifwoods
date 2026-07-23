import type { Metadata } from "next";
import { PolicyPage } from "@/components/shared/PolicyPage";
import { SHIPPING_POLICY } from "@/constants/policies/shipping";

export const metadata: Metadata = {
  title: SHIPPING_POLICY.title,
  description: SHIPPING_POLICY.description,
};

export default function ShippingPage() {
  return <PolicyPage document={SHIPPING_POLICY} />;
}
