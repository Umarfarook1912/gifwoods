/**
 * DB service — Products
 *
 * TODAY:  wraps Supabase PostgREST queries
 * LATER:  swap internals to pool.query() — callers stay unchanged
 */
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ITEMS_PER_PAGE } from "@/constants/ui";
import type { Product, Category } from "@/types/product";
import type { PaginatedResponse } from "@/types/common";

// ── Query filters type ────────────────────────────────────────────────────────

export interface ProductQueryFilters {
  category?: string | null;
  search?: string | null;
  sort?: string | null;
  featured?: string | null;
  bestseller?: string | null;
  newArrival?: string | null;
  page?: number;
  limit?: number;
  minPrice?: string | null;
  maxPrice?: string | null;
  /** If true, include draft/archived (admin). Default: only "active". */
  allStatuses?: boolean;
}

// ── Read ──────────────────────────────────────────────────────────────────────

/** Public / admin product list with filters, search, and pagination. */
export async function getProducts(
  filters: ProductQueryFilters
): Promise<PaginatedResponse<Product>> {
  const {
    category,
    search,
    sort = "newest",
    featured,
    bestseller,
    newArrival,
    page = 1,
    limit = ITEMS_PER_PAGE,
    minPrice,
    maxPrice,
    allStatuses = false,
  } = filters;

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(`*, category:categories(id, name, slug), reviews(rating)`, { count: "exact" });

  if (!allStatuses) query = query.eq("status", "active");

  // Category filter by slug
  if (category) {
    const { data: catData } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .maybeSingle();

    if (!catData) {
      return { data: [], total: 0, page, limit, totalPages: 0, error: null };
    }
    query = query.eq("category_id", catData.id);
  }

  if (featured === "true" || bestseller === "true") query = query.eq("is_bestseller", true);
  if (newArrival === "true") query = query.eq("is_new_arrival", true);
  if (minPrice) query = query.gte("price", parseFloat(minPrice));
  if (maxPrice) query = query.lte("price", parseFloat(maxPrice));
  if (search) query = query.ilike("name", `%${search}%`);

  switch (sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  const products = (data ?? []).map((p) => {
    const rawP = p as Record<string, unknown>;
    const reviews = (rawP.reviews as Array<{ rating: number }>) ?? [];
    const avg_rating =
      reviews.length > 0
        ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
        : undefined;
    const { reviews: _reviews, ...rest } = rawP;
    return { ...rest, avg_rating, review_count: reviews.length } as unknown as Product;
  });

  return {
    data: products,
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
    error: null,
  };
}

/** Single product by UUID or slug. */
export async function getProductByIdOrSlug(idOrSlug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
    .eq("status", "active")
    .single();

  if (error || !data) return null;
  return data as Product;
}

/** Count how many order_items reference this product (used to decide archive vs delete). */
export async function countOrderItemsByProduct(productId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);
  return count ?? 0;
}

/** Find a category by name for inline category creation inside product form. */
export async function findOrCreateInlineCategory(
  newCategoryName: string
): Promise<{ id: string; category: Category | null }> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("categories")
    .select("*")
    .ilike("name", newCategoryName.trim())
    .limit(1)
    .maybeSingle();

  if (existing) return { id: existing.id as string, category: null };

  const slug = newCategoryName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { data: newCat, error: insertErr } = await supabase
    .from("categories")
    .insert({ name: newCategoryName.trim(), slug })
    .select()
    .single();

  if (insertErr) throw insertErr;
  return { id: newCat.id as string, category: newCat as Category };
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function createProduct(
  data: Record<string, unknown>
): Promise<Product> {
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return product as Product;
}

export async function updateProduct(
  id: string,
  data: Record<string, unknown>
): Promise<Product> {
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return product as Product;
}

export async function archiveProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ status: "archived" })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}
