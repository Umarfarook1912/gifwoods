import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductGrid } from "@/components/features/products/ProductGrid";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/constants/routes";
import type { Product } from "@/types/product";

export const metadata: Metadata = {
  title: "Bestsellers",
  description: "Our most loved and requested signature personalized gifts.",
};

async function getBestsellers(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("status", "active")
    .eq("is_bestseller", true)
    .order("created_at", { ascending: false });

  return (data ?? []) as Product[];
}

export default async function BestsellersPage() {
  const products = await getBestsellers();

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-border bg-cream py-8">
        <div className="page-container">
          <Link
            href={ROUTES.HOME}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-warm-gray transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <h1 className="font-display text-3xl font-bold text-dark md:text-4xl">
            Bestsellers
          </h1>
          <p className="mt-2 text-warm-gray">
            Our most loved gifts — {products.length}{" "}
            {products.length === 1 ? "product" : "products"}
          </p>
        </div>
      </div>

      <div className="page-container py-8">
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-cream/40 px-6 py-16 text-center">
            <p className="font-display text-lg font-semibold text-dark">
              No bestsellers yet
            </p>
            <Link
              href={ROUTES.SHOP}
              className="mt-5 inline-flex rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gold-dark"
            >
              Browse all gifts
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
