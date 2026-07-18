import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/features/products/ProductDetailClient";
import { ReviewsSection } from "@/components/features/reviews/ReviewsSection";
import { BestsellersSection } from "@/components/features/products/BestsellersSection";
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

async function getReviews(productId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, user:profiles(id, name, avatar_url)")
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });
  return (data ?? []) as Review[];
}

async function getRelated(categoryId: string, currentId: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("category_id", categoryId)
    .eq("status", "active")
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

        {/* Reviews */}
        <div className="mt-16">
          <ReviewsSection reviews={reviews} productId={product.id} />
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <BestsellersSection products={related} />
          </div>
        )}
      </div>
    </div>
  );
}
