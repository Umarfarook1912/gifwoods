import type { Metadata } from "next";
import { AdminCategoriesClient } from "@/components/features/admin/AdminCategoriesClient";
import { getCategoriesWithCounts } from "@/lib/supabase/categories-db";

export const metadata: Metadata = { title: "Category Management" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesWithCounts();
  return <AdminCategoriesClient initialCategories={categories} />;
}
