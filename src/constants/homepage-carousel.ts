import type { HomepageCarouselSlot } from "@/types/homepage-carousel";

export const HOMEPAGE_CAROUSEL_SLOTS = {
  LEFT: "left",
  RIGHT: "right",
} as const satisfies Record<string, HomepageCarouselSlot>;

export const HOMEPAGE_CAROUSEL_SLOT_LABELS: Record<HomepageCarouselSlot, string> = {
  left: "Left (wide)",
  right: "Right (short)",
};

/** Recommended upload sizes so both banners share the same height on desktop. */
export const HOMEPAGE_CAROUSEL_SIZES = {
  left: {
    width: 1200,
    height: 480,
    ratioLabel: "2.5:1",
    description: "Wide rectangle for the main left carousel",
  },
  right: {
    width: 400,
    height: 480,
    ratioLabel: "5:6",
    description: "Short banner for the right carousel (same height as left)",
  },
} as const;

/** Fallback overlay copy when a slide has no custom headline/CTA. */
export const HOMEPAGE_CAROUSEL_OVERLAY_DEFAULTS: Record<
  HomepageCarouselSlot,
  { headline: string; subheadline: string; cta: string }
> = {
  left: {
    headline: "Gifts that feel personal",
    subheadline: "Handcrafted keepsakes for every celebration",
    cta: "Shop now",
  },
  right: {
    headline: "Featured pick",
    subheadline: "Made to treasure",
    cta: "Explore",
  },
};

export const HOMEPAGE_CAROUSEL_COPY = {
  ADMIN_TITLE: "Homepage Carousel",
  ADMIN_SUBTITLE:
    "Manage left and right homepage banners in one panel. Paste ImageKit or Cloudinary URLs.",
  SIZE_GUIDE_TITLE: "Image size guide",
  SIZE_GUIDE_LEFT: `Left (wide): ${HOMEPAGE_CAROUSEL_SIZES.left.width} × ${HOMEPAGE_CAROUSEL_SIZES.left.height} px (${HOMEPAGE_CAROUSEL_SIZES.left.ratioLabel})`,
  SIZE_GUIDE_RIGHT: `Right (short): ${HOMEPAGE_CAROUSEL_SIZES.right.width} × ${HOMEPAGE_CAROUSEL_SIZES.right.height} px (${HOMEPAGE_CAROUSEL_SIZES.right.ratioLabel})`,
  SIZE_GUIDE_NOTE:
    "Use JPG, PNG, or WebP. Keep both slides the same height so the row stays aligned on desktop.",
  MANAGE_CAROUSEL: "Manage carousel",
  OFFCANVAS_TITLE: "Edit homepage carousels",
  OFFCANVAS_DESC:
    "Add slides for both sides, optional overlay text, then save once. Sort order is per side (0 first).",
  ADD_SLIDE: "Add slide",
  IMAGE_URL_LABEL: "Image URL",
  IMAGE_URL_PLACEHOLDER: "https://ik.imagekit.io/... or https://res.cloudinary.com/...",
  LINK_URL_LABEL: "Navigation link",
  LINK_URL_PLACEHOLDER: "/shop or https://gifwoods.com/categories/...",
  HEADLINE_LABEL: "Headline (optional)",
  HEADLINE_PLACEHOLDER: "Gifts that feel personal",
  HEADLINE_EXAMPLE: "Examples: New Arrivals · Anniversary Gifts · Made Just for Them",
  SUBHEADLINE_LABEL: "Subheadline (optional)",
  SUBHEADLINE_PLACEHOLDER: "Handcrafted keepsakes for every celebration",
  SUBHEADLINE_EXAMPLE: "Examples: Free shipping over ₹1,500 · Engraved & gift-wrapped · Same-week dispatch",
  CTA_LABEL: "Button text (optional)",
  CTA_PLACEHOLDER: "Shop now",
  CTA_EXAMPLE: "Examples: Shop now · Explore · View collection · Buy gift",
  ALT_LABEL: "Alt text (optional)",
  SORT_LABEL: "Sort",
  ACTIVE_LABEL: "Active",
  SAVE_ALL: "Save all slides",
  EMPTY_SLOT: "No slides yet — add one below.",
  EMPTY: "No slides yet. Open Manage carousel to add left and right banners.",
  SECTION_EYEBROW: "Curated for you",
  AUTOPLAY_MS: 4500,
} as const;
