import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductGrid } from "@/components/features/products/ProductGrid";
import { ProductFilters } from "@/components/features/products/ProductFilters";
import { MobileProductFilters } from "@/components/features/products/MobileProductFilters";
import { ShopSortBar } from "@/components/features/products/ShopSortBar";
import { createClient } from "@/lib/supabase/server";
import { getAvailableCategories } from "@/lib/supabase/categories-db";
import type { Product } from "@/types/product";
import { ITEMS_PER_PAGE } from "@/constants/ui";

export const metadata: Metadata = {
  title: "Shop All Gifts",
  description:
    "Browse 500+ premium personalized gifts — from engraved frames to luxury hampers.",
};

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

async function getProducts(searchParams: Record<string, string>): Promise<{
  products: Product[];
  total: number;
}> {
  const supabase = await createClient();
  const { category, search, sort, minPrice, maxPrice, page = "1", badge } = searchParams;
  const pageNum = parseInt(page);
  const from = (pageNum - 1) * ITEMS_PER_PAGE;

  let query = supabase
    .from("products")
    .select("*, category:categories(id, name, slug)", { count: "exact" })
    .eq("status", "active");

  if (category) {
    const { data: catData } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .maybeSingle();

    if (catData) {
      query = query.eq("category_id", catData.id);
    } else {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);
      if (isUUID) {
        query = query.eq("category_id", category);
      } else {
        return { products: [], total: 0 };
      }
    }
  }

  if (badge) {
    query = query.eq("badge", badge);
  }

  if (minPrice) query = query.gte("price", parseFloat(minPrice));
  if (maxPrice) query = query.lte("price", parseFloat(maxPrice));
  if (search) query = query.ilike("name", `%${search}%`);

  switch (sort) {
    case "price-asc": query = query.order("price", { ascending: true }); break;
    case "price-desc": query = query.order("price", { ascending: false }); break;
    default: query = query.order("created_at", { ascending: false });
  }

  const { data, count } = await query.range(from, from + ITEMS_PER_PAGE - 1);
  return { products: (data ?? []) as Product[], total: count ?? 0 };
}

export default async function ShopPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [{ products, total }, categories] = await Promise.all([
    getProducts(params),
    getAvailableCategories(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-cream border-b border-border py-8">
        <div className="page-container">
          <h1 className="font-display text-3xl font-bold text-dark">
            {params.category
              ? categories.find((c) => c.slug === params.category)?.name ?? "Products"
              : "All Gifts"}
          </h1>
          <p className="text-warm-gray mt-1">{total} products</p>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="flex gap-8">
          <div className="hidden lg:block w-56 flex-shrink-0">
            <Suspense fallback={null}>
              <ProductFilters categories={categories} />
            </Suspense>
          </div>
          <div className="flex-1 min-w-0">
            <Suspense fallback={null}>
              <div className="mb-4 lg:hidden">
                <MobileProductFilters categories={categories} />
              </div>
              <ShopSortBar total={total} />
            </Suspense>
            <div className="mt-6">
              <ProductGrid products={products} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
