import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderCard } from "@/components/features/reviews/OrderCard";
import { ROUTES } from "@/constants/routes";
import type { Order } from "@/types/order";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View and track all your Gifwoods orders.",
};

async function getOrders(userId: string): Promise<Order[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*, product:products(id, name, images, slug))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []) as Order[];
}

export default async function OrdersPage() {
  const session = await auth();
  if (!session) redirect(ROUTES.LOGIN);

  const userId = session.user.supabaseId ?? session.user.id;
  const orders = await getOrders(userId);

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-dark mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-border">
            <p className="text-warm-gray text-lg mb-2">No orders yet</p>
            <p className="text-muted-foreground text-sm">
              When you place an order, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
