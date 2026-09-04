/**
 * DB service — Categories
 *
 * TODAY:  wraps Supabase PostgREST queries
 * LATER:  swap internals to pool.query() — callers stay unchanged
 */
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Category } from "@/types/product";

// ── Public helpers ────────────────────────────────────────────────────────────

/** Categories that have at least one active product (for nav / public filters). */
export async function getAvailableCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, image_url, description, created_at, products!inner(id)")
    .eq("products.status", "active")
    .eq("products.is_test", false)
    .order("name");

  if (!data) return [];

  const seen = new Map<string, Category>();
  for (const row of data) {
    const { products: _products, ...cat } = row as Category & { products: unknown };
    if (!seen.has(cat.id)) seen.set(cat.id, cat);
  }
  return Array.from(seen.values());
}

/** All categories with active-product filter toggle (for API route GET). */
export async function getCategories(withActiveProductsOnly = false): Promise<Category[]> {
  const supabase = await createClient();

  if (withActiveProductsOnly) {
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, image_url, description, created_at, products!inner(id)")
      .eq("products.status", "active")
      .eq("products.is_test", false)
      .order("name", { ascending: true });

    return (data ?? []).map((row) => {
      const { products: _products, ...cat } = row as Record<string, unknown>;
      return cat as unknown as Category;
    });
  }

  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  return (data ?? []) as Category[];
}

/** All categories with product counts (for admin management). */
export async function getCategoriesWithCounts(): Promise<
  Array<Category & { product_count: number }>
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, image_url, description, created_at, products(count)")
    .order("name");

  return (data ?? []).map((row) => {
    const { products, ...cat } = row as Category & { products: Array<{ count: number }> };
    return { ...cat, product_count: products?.[0]?.count ?? 0 };
  });
}

/** Find a single category by slug. */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data as Category) ?? null;
}

/** Find a category by name (case-insensitive). Used to prevent duplicates. */
export async function getCategoryByName(name: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name")
    .ilike("name", name.trim())
    .maybeSingle();
  return (data as Category) ?? null;
}

/** Find a category by partial name match (for inline product-form category creation). */
export async function findCategoryByNamePartial(name: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .ilike("name", name.trim())
    .limit(1)
    .maybeSingle();
  return (data as Category) ?? null;
}

// ── Write operations ──────────────────────────────────────────────────────────

/** Create a new category. */
export async function createCategory(payload: {
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
}): Promise<Category> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Category;
}

/** Count active products belonging to a category. */
export async function countProductsInCategory(categoryId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);
  return count ?? 0;
}

/** Delete a category by id (caller must verify no products exist first). */
export async function deleteCategory(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}
