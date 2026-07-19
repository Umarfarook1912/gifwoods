import type { Metadata } from "next";
import { HeroSection } from "@/components/features/products/HeroSection";
import { MediaLogos } from "@/components/features/products/MediaLogos";
import { ProductSectionCarousel } from "@/components/features/products/ProductSectionCarousel";
import { OccasionsCarousel } from "@/components/features/products/OccasionsCarousel";
import { PersonalizeSection } from "@/components/features/products/PersonalizeSection";
import { WhyUsSection } from "@/components/features/products/WhyUsSection";
import { TestimonialsSection } from "@/components/features/products/TestimonialsSection";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";

export const metadata: Metadata = {
  title: "Gifwoods — Premium Personalized Gifts for Every Occasion",
  description:
    "Premium personalized gifts crafted to celebrate every special moment — engraved, hand-packed, and delivered with intention.",
};

async function getBestsellers(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("status", "active")
    .or("badge.eq.Bestseller,is_featured.eq.true")
    .order("created_at", { ascending: false })
    .limit(8);

  return (data ?? []) as Product[];
}

async function getNewArrivals(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(8);

  return (data ?? []) as Product[];
}

export default async function HomePage() {
  const [bestsellers, newArrivals] = await Promise.all([
    getBestsellers(),
    getNewArrivals(),
  ]);

  return (
    <>
      <HeroSection />
      <MediaLogos />
      
      {/* Section 1: Best Sellers */}
      <ProductSectionCarousel
        title="Bestsellers"
        subtitle="Our most loved and requested signature personalized gifts."
        products={bestsellers}
        viewAllHref="/shop?badge=Bestseller"
        bgClass="bg-white"
        badgeLabel="Loved by our gifters"
      />

      {/* Section 2: New Arrivals */}
      <ProductSectionCarousel
        title="New Arrivals"
        subtitle="Explore our latest custom creations finished by hand in our atelier."
        products={newArrivals}
        viewAllHref="/shop?sort=newest"
        bgClass="bg-cream/40"
        badgeLabel="Freshly Crafted"
      />

      {/* Section 3: Shop by Occasion / Celebration Collections */}
      <OccasionsCarousel />

      <PersonalizeSection />
      <WhyUsSection />
      <TestimonialsSection />
    </>
  );
}
