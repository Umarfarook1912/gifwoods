

export const CURRENCY_SYMBOL = "₹";

export const SITE_NAME = "Gifwoods";
export const SITE_TAGLINE = "A luxury gifting atelier";
export const SITE_DESCRIPTION =
  "Premium personalized gifts crafted to celebrate every special moment — engraved, hand-packed, and delivered with intention.";

export const OCCASIONS = [
  { label: "Birthday", href: "/categories/birthdays" },
  { label: "Anniversary", href: "/categories/anniversary" },
  { label: "Wedding", href: "/categories/weddings" },
  { label: "Housewarming", href: "/categories/housewarming" },
  { label: "Baby Shower", href: "/categories/baby-shower" },
] as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Best Sellers", href: "/bestsellers" },
  { label: "Categories", href: "#", dropdown: true },
  { label: "Corporate Gifting", href: "/categories/corporate" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_SHOP_LINKS = [
  { label: "Personalized", href: "/categories/personalized" },
  { label: "Weddings", href: "/categories/weddings" },
  { label: "Corporate", href: "/categories/corporate" },
  { label: "Hampers", href: "/categories/hampers" },
  { label: "New Arrivals", href: "/new-arrivals" },
] as const;

export const FOOTER_COMPANY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQs", href: "/faqs" },
  { label: "Blog", href: "#" },
  { label: "Careers", href: "#" },
] as const;

export const FOOTER_SUPPORT_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Refund Policy", href: "/refund" },
  { label: "Terms", href: "/terms" },
  { label: "Shipping", href: "/shipping" },
] as const;

export const SUPPORT_NAV_LINKS = [
  { label: "Shipping", href: "/shipping" },
  { label: "Refunds", href: "/refund" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;

export const SUPPORT_PAGE_EYEBROW = "Support";
export const SUPPORT_CONTACT_CTA_TITLE = "Still need help?";
export const SUPPORT_CONTACT_CTA_DESCRIPTION =
  "Our team is available 7 days a week for order and gift questions.";
export const SUPPORT_CONTACT_CTA_LABEL = "Contact Us";
export const SUPPORT_LAST_UPDATED_PREFIX = "Last updated";

export const CONTACT_INFO = {
  phone: "7010969348",
  phoneFormatted: "+91 7010969348",
  email: "gifwoodsoffice@gmail.com",
  address: "G1A, VOC Nagar, Parisutham Nagar, Thanjavur, Tamil Nadu 613007",
  mapUrl: "https://maps.google.com/?q=G1A,+VOC+Nagar,+Parisutham+Nagar,+Thanjavur,+Tamil+Nadu+613007",
  mapEmbedUrl: "https://maps.google.com/maps?q=G1A,+VOC+Nagar,+Parisutham+Nagar,+Thanjavur,+Tamil+Nadu+613007&t=&z=16&ie=UTF8&iwloc=&output=embed",
} as const;

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/gifwoods_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
  youtube: "https://www.youtube.com/channel/UCOXu-Pw7731tU0h0AjG4A2g",
  email: "mailto:gifwoodsoffice@gmail.com",
  phone: "tel:+917010969348",
  whatsapp: "https://wa.me/917010969348",
} as const;

export const MEDIA_LOGOS = [
  "Vogue India",
  "Elle Decor",
  "Condé Nast",
  "The Hindu",
  "Femina",
  "Architectural Digest",
  "Verve",
] as const;

export const WHY_US_ITEMS = [
  {
    title: "Handcrafted Quality",
    description: "Every gift finished by hand in our atelier.",
    icon: "gem",
  },
  {
    title: "Deep Personalization",
    description: "Names, photos, engraving, fonts — your story.",
    icon: "pen-tool",
  },
  {
    title: "Secure Payments",
    description: "Cashfree UPI, cards, netbanking & wallets.",
    icon: "shield-check",
  },
  {
    title: "Signature Packaging",
    description: "Ribbons, seals and a handwritten note.",
    icon: "gift",
  },
  {
    title: "Careful Dispatch",
    description: "Insured shipping across India.",
    icon: "package",
  },
  {
    title: "Human Support",
    description: "Real people, real fast — 7 days a week.",
    icon: "headphones",
  },
] as const;

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const FULFILLMENT_STATUSES = [
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const PRODUCT_HOME_TOGGLE_LABELS = {
  BESTSELLER: "Bestseller",
  NEW_ARRIVAL: "New Arrival",
} as const;

export const PRODUCT_BADGES = ["Personalize", "Limited"] as const;

export const PRODUCT_STATUSES = ["active", "draft", "archived"] as const;

export const NEW_CATEGORY_OPTION = "__new__";

export const ITEMS_PER_PAGE = 12;
export const ADMIN_ITEMS_PER_PAGE = 20;

export const HOME_EXPLORE_PRODUCTS_DESKTOP = 8;
export const HOME_EXPLORE_PRODUCTS_MOBILE = 6;
export const HOME_VIEW_ALL_PRODUCTS_LABEL = "View All Products";

export const SHOP_FILTERS_LABEL = "Filters";

/** Primary brand gold — matches CSS `--color-gold` */
export const BRAND_GOLD = "#e5a93c";
export const LOADER_SIZE = "medium" as const;

export const MIN_ORDER_FOR_FREE_WRAP = 1499;
export const FREE_SHIPPING_THRESHOLD = 500;
export const STANDARD_SHIPPING_FEE = 60;
export const MIN_CORPORATE_ORDER = 25;
