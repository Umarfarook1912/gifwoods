import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils/formatters";
import { ShoppingBag, Users, Star, Package, TrendingUp } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = { title: "Admin Dashboard" };

async function getStats() {
  const supabase = createAdminClient();
  const [orders, users, products, reviews, revenue] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("is_approved", false),
    supabase.from("orders").select("total").eq("status", "delivered"),
  ]);

  const totalRevenue = (revenue.data ?? []).reduce((s, o) => s + (o.total ?? 0), 0);

  return {
    orders: orders.count ?? 0,
    users: users.count ?? 0,
    products: products.count ?? 0,
    pendingReviews: reviews.count ?? 0,
    totalRevenue,
  };
}

async function getRecentOrders() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("id, status, total, created_at, user:profiles(name, email)")
    .order("created_at", { ascending: false })
    .limit(5);
  return data ?? [];
}

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([getStats(), getRecentOrders()]);

  const KPI_CARDS = [
    { label: "Total Orders", value: stats.orders, icon: ShoppingBag, href: ROUTES.ADMIN.ORDERS },
    { label: "Total Revenue", value: formatPrice(stats.totalRevenue), icon: TrendingUp, href: ROUTES.ADMIN.ORDERS },
    { label: "Active Products", value: stats.products, icon: Package, href: ROUTES.ADMIN.PRODUCTS },
    { label: "Total Users", value: stats.users, icon: Users, href: ROUTES.ADMIN.USERS },
    { label: "Pending Reviews", value: stats.pendingReviews, icon: Star, href: ROUTES.ADMIN.REVIEWS },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <h1 className="font-display text-2xl font-bold text-dark mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {KPI_CARDS.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-xl border border-border p-4 hover:border-gold/50 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center mb-3">
              <Icon className="h-4 w-4 text-gold" />
            </div>
            <p className="font-bold text-xl text-dark">{value}</p>
            <p className="text-xs text-warm-gray mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-dark">Recent Orders</h2>
          <Link href={ROUTES.ADMIN.ORDERS} className="text-sm text-gold hover:underline">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentOrders.map((order) => {
            const user = order.user as { name?: string; email?: string } | null;
            return (
              <div key={order.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-dark">{user?.name ?? user?.email ?? "Guest"}</p>
                  <p className="text-xs text-warm-gray">
                    #{order.id.slice(0, 8).toUpperCase()} · {new Date(order.created_at as string).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{formatPrice(order.total as number)}</span>
                  <span className={`text-xs capitalize px-2 py-0.5 rounded-full font-medium ${
                    order.status === "delivered" ? "bg-emerald-100 text-emerald-700" :
                    order.status === "paid" ? "bg-blue-100 text-blue-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {order.status as string}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
