import type { Metadata } from "next";
import { AdminOrdersClient } from "@/components/features/admin/AdminOrdersClient";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Order } from "@/types/order";

export const metadata: Metadata = { title: "Order Management" };
export const dynamic = "force-dynamic";

async function getOrders(): Promise<Order[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("*, user:profiles(id, name, email), order_items(id, quantity, unit_price, customization, product:products(id, name, customization_text, customization_image))")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []) as Order[];
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  return <AdminOrdersClient initialOrders={orders} />;
}
