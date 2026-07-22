

export const CURRENCY_SYMBOL = "₹";

export const SITE_NAME = "Gifwoods";
export const SITE_TAGLINE = "A luxury gifting atelier";
export const SITE_DESCRIPTION =
  "Premium personalized gifts crafted to celebrate every special moment — engraved, hand-packed, and delivered with intention.";

export const OCCASIONS = [
  { label: "Birthday", href: "/shop?category=birthdays" },
  { label: "Anniversary", href: "/shop?category=anniversary" },
  { label: "Wedding", href: "/shop?category=weddings" },
  { label: "Housewarming", href: "/shop?category=housewarming" },
  { label: "Baby Shower", href: "/shop?category=baby-shower" },
] as const;

export const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "New Arrivals", href: "/shop?newArrival=true" },
  { label: "Best Sellers", href: "/shop?bestseller=true" },
  { label: "Categories", href: "#", dropdown: true },
  { label: "Corporate Gifting", href: "/shop?category=corporate" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_SHOP_LINKS = [
  { label: "Personalized", href: "/shop?category=personalized" },
  { label: "Weddings", href: "/shop?category=weddings" },
  { label: "Corporate", href: "/shop?category=corporate" },
  { label: "Hampers", href: "/shop?category=hampers" },
  { label: "New Arrivals", href: "/shop?newArrival=true" },
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
  { label: "Track Order", href: "/orders" },
] as const;

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

export const MIN_ORDER_FOR_FREE_WRAP = 1499;
export const FREE_SHIPPING_THRESHOLD = 500;
export const STANDARD_SHIPPING_FEE = 60;
export const MIN_CORPORATE_ORDER = 25;
