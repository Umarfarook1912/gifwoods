export const ANNOUNCEMENT_TEXT =
  "Festive edit is live — complimentary gift wrap on orders over ₹1,499";

export const CURRENCY_SYMBOL = "₹";

export const SITE_NAME = "Gifwoods";
export const SITE_TAGLINE = "A luxury gifting atelier";
export const SITE_DESCRIPTION =
  "Premium personalized gifts crafted to celebrate every special moment — engraved, hand-packed, and delivered with intention.";

export const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/shop?view=categories" },
  { label: "Customized", href: "/shop?category=personalized" },
  { label: "Corporate", href: "/shop?category=corporate" },
  { label: "Occasions", href: "/shop?view=occasions" },
  { label: "About", href: "/about" },
] as const;

export const FOOTER_SHOP_LINKS = [
  { label: "Personalized", href: "/shop?category=personalized" },
  { label: "Weddings", href: "/shop?category=weddings" },
  { label: "Corporate", href: "/shop?category=corporate" },
  { label: "Hampers", href: "/shop?category=hampers" },
  { label: "New Arrivals", href: "/shop?sort=newest" },
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

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/gifwoods",
  facebook: "https://facebook.com/gifwoods",
  pinterest: "https://pinterest.com/gifwoods",
  whatsapp: "https://wa.me/919999999999",
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
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const PRODUCT_BADGES = ["Personalize", "Bestseller", "New", "Limited"] as const;

export const ITEMS_PER_PAGE = 12;
export const ADMIN_ITEMS_PER_PAGE = 20;

export const MIN_ORDER_FOR_FREE_WRAP = 1499;
export const MIN_CORPORATE_ORDER = 25;
