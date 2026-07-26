import { createClient } from "./server";
import { createAdminClient } from "./admin";
import type { Review } from "@/types/review";

export async function getProductReviews(productId: string, isApproved?: boolean): Promise<Review[]> {
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

export async function createReview(
  userId: string,
  payload: { product_id: string; order_id?: string | null; rating: number; comment: string }
): Promise<Review> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      product_id: payload.product_id,
      order_id: payload.order_id || null,
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
