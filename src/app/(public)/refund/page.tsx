import type { Metadata } from "next";
import { PolicyPage } from "@/components/shared/PolicyPage";
import { REFUND_POLICY } from "@/constants/policies/refund";

export const metadata: Metadata = {
  title: REFUND_POLICY.title,
  description: REFUND_POLICY.description,
};

export default function RefundPage() {
  return <PolicyPage document={REFUND_POLICY} />;
}
