export type HomepageCarouselSlot = "left" | "right";

export interface HomepageCarouselSlide {
  id: string;
  slot: HomepageCarouselSlot;
  image_url: string;
  link_url: string;
  alt_text: string | null;
  headline: string | null;
  subheadline: string | null;
  cta_label: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HomepageCarouselSlideInput {
  slot: HomepageCarouselSlot;
  image_url: string;
  link_url: string;
  alt_text?: string | null;
  headline?: string | null;
  subheadline?: string | null;
  cta_label?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

/** Draft row in the admin offcanvas (left + right managed together). */
export interface HomepageCarouselDraftSlide {
  clientId: string;
  id?: string;
  image_url: string;
  link_url: string;
  alt_text: string;
  headline: string;
  subheadline: string;
  cta_label: string;
  sort_order: number;
  is_active: boolean;
}
