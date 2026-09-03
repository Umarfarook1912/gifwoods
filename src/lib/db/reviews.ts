/**
 * DB service — Reviews
 *
 * TODAY:  wraps Supabase PostgREST queries
 * LATER:  swap internals to pool.query() — callers stay unchanged
 */
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Review } from "@/types/review";

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getProductReviews(
  productId: string,
  isApproved?: boolean
): Promise<Review[]> {
  const supabase = await createClient();
  let query = supabase
    .from("reviews")
    .select("*, user:profiles(id, name, avatar_url)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (isApproved !== undefined) {
    query = query.eq("is_approved", isApproved);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Review[];
}

export async function getAllReviews(): Promise<Review[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, user:profiles(id, name, email), product:products(id, name, slug)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Review[];
}

export async function getApprovedReviews(limit?: number): Promise<Review[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from("reviews")
    .select("*, user:profiles(id, name, avatar_url), product:products(id, name, slug)")
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Review[];
}

// ── Eligibility check ─────────────────────────────────────────────────────────

/** Check whether a user is eligible to review a product (delivered order required). */
export async function checkReviewEligibility(
  userId: string,
  productId: string,
  orderId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data: eligible } = await supabase
    .from("order_items")
    .select("id, order:orders!inner(id, user_id, status)")
    .eq("product_id", productId)
    .eq("order_id", orderId);

  return (eligible ?? []).some((item) => {
    const order = (item.order as unknown) as Record<string, unknown> | null;
    return order?.user_id === userId && order?.status === "delivered";
  });
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function createReview(
  userId: string,
  payload: {
    product_id: string;
    order_id?: string | null;
    rating: number;
    comment: string;
  }
): Promise<Review> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      product_id: payload.product_id,
      order_id: payload.order_id ?? null,
      rating: payload.rating,
      comment: payload.comment,
      user_id: userId,
      is_approved: false,
    })
    .select("*, user:profiles(id, name, avatar_url), product:products(id, name, slug)")
    .single();

  if (error) throw error;
  return data as Review;
}

export async function updateReview(
  reviewId: string,
  payload: { is_approved?: boolean; admin_reply?: string | null }
): Promise<Review> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reviews")
    .update(payload)
    .eq("id", reviewId)
    .select()
    .single();

  if (error) throw error;
  return data as Review;
}

export async function deleteReview(reviewId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) throw error;
  return true;
}
