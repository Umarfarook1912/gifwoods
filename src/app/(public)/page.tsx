import type { Metadata } from "next";
import { HeroSection } from "@/components/features/products/HeroSection";
import { MediaLogos } from "@/components/features/products/MediaLogos";
import { CategoriesGrid } from "@/components/features/products/CategoriesGrid";
import { BestsellersSection } from "@/components/features/products/BestsellersSection";
import { PersonalizeSection } from "@/components/features/products/PersonalizeSection";
import { WhyUsSection } from "@/components/features/products/WhyUsSection";
import { TestimonialsSection } from "@/components/features/products/TestimonialsSection";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";
import type { Category } from "@/types/product";

export const metadata: Metadata = {
  title: "Gifwoods — Premium Personalized Gifts for Every Occasion",
  description:
    "Premium personalized gifts crafted to celebrate every special moment — engraved, hand-packed, and delivered with intention.",
};

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("status", "active")
    .eq("is_featured", true)
    .limit(4)
    .order("created_at", { ascending: false });

  return (data ?? []) as Product[];
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  return (data ?? []) as Category[];
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <>
      <HeroSection />
      <MediaLogos />
      <CategoriesGrid categories={categories} />
      <BestsellersSection products={products} />
      <PersonalizeSection />
      <WhyUsSection />
      <TestimonialsSection />
    </>
  );
}
