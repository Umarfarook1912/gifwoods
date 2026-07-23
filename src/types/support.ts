export interface PolicySection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  numbered?: string[];
}

export interface PolicyDocument {
  title: string;
  description: string;
  lastUpdated: string;
  sections: PolicySection[];
}
