import type { Metadata } from "next";
import { AdminProductsClient } from "@/components/features/admin/AdminProductsClient";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Product } from "@/types/product";
import type { Category } from "@/types/product";

export const metadata: Metadata = { title: "Product Management" };

async function getProducts(): Promise<Product[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .order("created_at", { ascending: false });
  return (data ?? []) as Product[];
}

async function getCategories(): Promise<Category[]> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("categories").select("*").order("name");
  return (data ?? []) as Category[];
}

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return <AdminProductsClient initialProducts={products} categories={categories} />;
}
