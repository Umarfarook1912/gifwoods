import type { Metadata } from "next";
import { AdminReviewsClient } from "@/components/features/admin/AdminReviewsClient";
import { getAllReviews } from "@/lib/supabase/reviews-db";

export const metadata: Metadata = { title: "Review Management" };
export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();
  return <AdminReviewsClient initialReviews={reviews} />;
}
