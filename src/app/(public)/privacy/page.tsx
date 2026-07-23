import type { Metadata } from "next";
import { PolicyPage } from "@/components/shared/PolicyPage";
import { PRIVACY_POLICY } from "@/constants/policies/privacy";

export const metadata: Metadata = {
  title: PRIVACY_POLICY.title,
  description: PRIVACY_POLICY.description,
};

export default function PrivacyPage() {
  return <PolicyPage document={PRIVACY_POLICY} />;
}
