import type { Metadata } from "next";
import { AdminReviewsClient } from "@/components/features/admin/AdminReviewsClient";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Review } from "@/types/review";

export const metadata: Metadata = { title: "Review Management" };

async function getReviews(): Promise<Review[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, user:profiles(id, name, email), product:products(id, name, slug)")
    .order("created_at", { ascending: false });
  return (data ?? []) as Review[];
}

export default async function AdminReviewsPage() {
  const reviews = await getReviews();
  return <AdminReviewsClient initialReviews={reviews} />;
}
