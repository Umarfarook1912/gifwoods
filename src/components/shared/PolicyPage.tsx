import { PolicySections } from "@/components/features/support/PolicySections";
import { SupportPageLayout } from "@/components/shared/SupportPageLayout";
import type { PolicyDocument } from "@/types/support";

interface Props {
  document: PolicyDocument;
}

export function PolicyPage({ document }: Props) {
  return (
    <SupportPageLayout
      title={document.title}
      description={document.description}
      lastUpdated={document.lastUpdated}
    >
      <PolicySections sections={document.sections} />
    </SupportPageLayout>
  );
}
