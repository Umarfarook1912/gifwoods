import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/features/products/ProductDetailClient";
import { ProductTabs } from "@/components/features/products/ProductTabs";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";
import type { Review } from "@/types/review";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("slug", slug)
    .eq("status", "active")
    .single();
  return (data as Product) ?? null;
}

import { getProductReviews } from "@/lib/supabase/reviews-db";

async function getReviews(productId: string): Promise<Review[]> {
  return getProductReviews(productId, true);
}

async function getRelated(categoryId: string, currentId: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("category_id", categoryId)
    .eq("status", "active")
    .eq("is_test", false)
    .neq("id", currentId)
    .limit(4);
  return (data ?? []) as Product[];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [reviews, related] = await Promise.all([
    getReviews(product.id),
    product.category_id ? getRelated(product.category_id, product.id) : Promise.resolve([]),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <div className="page-container py-10">
        <div className="animate-fade-up">
          <ProductDetailClient product={product} />
        </div>

        {/* Tabbed description / specs / reviews + related products */}
        <ProductTabs product={product} reviews={reviews} related={related} />
      </div>
    </div>
  );
}
