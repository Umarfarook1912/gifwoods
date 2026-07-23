import type { Metadata } from "next";
import { FaqsAccordion } from "@/components/features/support/FaqsAccordion";
import { SupportPageLayout } from "@/components/shared/SupportPageLayout";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Everything you need to know about ordering, personalization, and delivery at Gifwoods.",
};

export default function FaqsPage() {
  return (
    <SupportPageLayout
      title="Frequently Asked Questions"
      description="Everything you need to know about ordering, personalization, and delivery."
    >
      <FaqsAccordion />
    </SupportPageLayout>
  );
}
