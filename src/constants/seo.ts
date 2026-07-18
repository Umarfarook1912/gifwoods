export const DEFAULT_SEO = {
  siteName: "Gifwoods",
  title: "Gifwoods — Premium Personalized Gifts for Every Occasion",
  description:
    "Premium personalized gifts crafted to celebrate every special moment — engraved, hand-packed, and delivered with intention. Shop from 500+ custom designs.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://gifwoods.in",
  ogImage: "/og-image.jpg",
  twitter: "@gifwoods",
  locale: "en_IN",
} as const;
