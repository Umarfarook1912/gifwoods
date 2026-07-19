import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types/product";

/** Categories that have at least one active product (for public filters/nav). */
export async function getAvailableCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, image_url, description, created_at, products!inner(id)")
    .eq("products.status", "active")
    .order("name");

  return (data ?? []).map((row) => {
    const { products: _products, ...category } = row as Category & {
      products: unknown;
    };
    return category;
  });
}

/** All categories with their product counts (for admin management). */
export async function getCategoriesWithCounts(): Promise<
  Array<Category & { product_count: number }>
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, image_url, description, created_at, products(count)")
    .order("name");

  return (data ?? []).map((row) => {
    const { products, ...category } = row as Category & {
      products: Array<{ count: number }>;
    };
    return { ...category, product_count: products?.[0]?.count ?? 0 };
  });
}
