import type { Metadata } from "next";
import { PolicyPage } from "@/components/shared/PolicyPage";
import { TERMS_POLICY } from "@/constants/policies/terms";

export const metadata: Metadata = {
  title: TERMS_POLICY.title,
  description: TERMS_POLICY.description,
};

export default function TermsPage() {
  return <PolicyPage document={TERMS_POLICY} />;
}
