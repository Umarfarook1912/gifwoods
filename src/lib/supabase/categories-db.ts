import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types/product";

/** Categories that have at least one active product (for public filters/nav). */
export async function getAvailableCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, image_url, description, created_at, products!inner(id)")
    .eq("products.status", "active")
    .eq("products.is_test", false)
    .order("name");

  if (!data) return [];

  const categoryMap = new Map<string, Category>();
  for (const row of data) {
    const { products: _products, ...category } = row as Category & {
      products: unknown;
    };
    if (!categoryMap.has(category.id)) {
      categoryMap.set(category.id, category);
    }
  }

  return Array.from(categoryMap.values());
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
