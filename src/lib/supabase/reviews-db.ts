import { createClient } from "./server";
import { createAdminClient } from "./admin";
import fs from "fs/promises";
import path from "path";
import type { Review } from "@/types/review";
import type { UserProfile } from "@/types/user";

const MOCK_DB_PATH = path.join(process.cwd(), "src/lib/supabase/mock-db.json");

interface MockStore {
  addresses: any[];
  payment_methods: any[];
  reviews: Review[];
}

async function getMockStore(): Promise<MockStore> {
  try {
    const data = await fs.readFile(MOCK_DB_PATH, "utf-8");
    const parsed = JSON.parse(data);
    if (!parsed.reviews) parsed.reviews = [];
    return parsed;
  } catch {
    const defaultStore: MockStore = { addresses: [], payment_methods: [], reviews: [] };
    await fs.writeFile(MOCK_DB_PATH, JSON.stringify(defaultStore, null, 2));
    return defaultStore;
  }
}

async function saveMockStore(store: MockStore): Promise<void> {
  await fs.writeFile(MOCK_DB_PATH, JSON.stringify(store, null, 2));
}

function isTableOrColumnMissingError(error: any): boolean {
  if (!error) return false;
  return (
    error.code === "42P01" || // Table missing
    error.code === "42703" || // Column missing (e.g. admin_reply)
    (error.message && error.message.includes("Could not find the table")) ||
    (error.message && error.message.includes("column \"admin_reply\" does not exist")) ||
    (error.message && error.message.includes("violates row-level security")) ||
    (error.message && error.message.includes("null value in column \"order_id\""))
  );
}

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

  if (error) {
    if (isTableOrColumnMissingError(error)) {
      console.warn("Reviews fallback triggered for product reviews listing");
      const store = await getMockStore();
      const list = store.reviews.filter((r) => r.product_id === productId);
      if (isApproved !== undefined) {
        return list.filter((r) => r.is_approved === isApproved);
      }
      return list;
    }
    throw error;
  }

  return (data ?? []) as Review[];
}

export async function getAllReviews(): Promise<Review[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, user:profiles(id, name, email), product:products(id, name, slug)")
    .order("created_at", { ascending: false });

  if (error) {
    if (isTableOrColumnMissingError(error)) {
      console.warn("Reviews fallback triggered for admin reviews listing");
      const store = await getMockStore();
      return store.reviews;
    }
    throw error;
  }

  return (data ?? []) as Review[];
}

export async function createReview(
  userId: string,
  payload: { product_id: string; order_id?: string | null; rating: number; comment: string }
): Promise<Review> {
  const supabase = await createClient();

  // Try to fetch profile for local mock rendering
  let userProfile: UserProfile = {
    id: userId,
    name: "Customer",
    avatar_url: null,
    email: "",
    role: "user",
    phone: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  try {
    const { data: p } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (p) {
      userProfile = p as UserProfile;
    }
  } catch {}

  // Fetch product for mock details
  let productProfile = { id: payload.product_id, name: "Product", slug: "" };
  try {
    const { data: prod } = await supabase.from("products").select("id, name, slug").eq("id", payload.product_id).single();
    if (prod) {
      productProfile = { id: prod.id, name: prod.name, slug: prod.slug };
    }
  } catch {}

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
    .select()
    .single();

  if (error) {
    if (isTableOrColumnMissingError(error)) {
      const store = await getMockStore();
      const newReview: Review = {
        id: crypto.randomUUID(),
        user_id: userId,
        user: userProfile,
        product_id: payload.product_id,
        product: productProfile,
        order_id: payload.order_id || null,
        rating: payload.rating,
        comment: payload.comment,
        is_approved: false,
        admin_reply: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.reviews.push(newReview);
      await saveMockStore(store);
      return newReview;
    }
    throw error;
  }

  return {
    ...data,
    user: userProfile,
    product: productProfile,
  } as Review;
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

  if (error) {
    if (isTableOrColumnMissingError(error)) {
      const store = await getMockStore();
      const index = store.reviews.findIndex((r) => r.id === reviewId);
      if (index === -1) throw new Error("Review not found");

      const updated = {
        ...store.reviews[index],
        ...payload,
        updated_at: new Date().toISOString(),
      };
      store.reviews[index] = updated;
      await saveMockStore(store);
      return updated;
    }
    throw error;
  }

  return data as Review;
}

export async function deleteReview(reviewId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

  if (error) {
    if (isTableOrColumnMissingError(error)) {
      const store = await getMockStore();
      const before = store.reviews.length;
      store.reviews = store.reviews.filter((r) => r.id !== reviewId);
      await saveMockStore(store);
      return store.reviews.length < before;
    }
    throw error;
  }

  return true;
}
