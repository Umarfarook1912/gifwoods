import {
  bucketsToSeries,
  buildAnalyticsBuckets,
  resolveBucketKey,
} from "@/lib/admin/analytics-buckets";
import type { DashboardMetricKey, StatusBarPoint } from "@/types/admin-dashboard";
import { getRecentOrders } from "@/lib/db/orders";
import { createAdminClient } from "@/lib/supabase/admin";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-400",
  paid: "bg-sky-400",
  processing: "bg-blue-500",
  shipped: "bg-indigo-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-rose-400",
};

export async function getDashboardKpis() {
  const supabase = createAdminClient();
  const [orders, users, products, reviews, revenue] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("is_approved", false),
    supabase.from("orders").select("total").eq("payment_status", "paid"),
  ]);

  return {
    orders: orders.count ?? 0,
    users: users.count ?? 0,
    products: products.count ?? 0,
    pendingReviews: reviews.count ?? 0,
    totalRevenue: (revenue.data ?? []).reduce((s, o) => s + Number(o.total ?? 0), 0),
  };
}

export async function getAnalyticsSeries(days: number, metric: DashboardMetricKey = "revenue") {
  const supabase = createAdminClient();
  const { since, buckets, granularity } = buildAnalyticsBuckets(days);

  const [ordersRes, usersRes] = await Promise.all([
    supabase
      .from("orders")
      .select("total, created_at, payment_status, status")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true }),
    supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true }),
  ]);

  for (const order of ordersRes.data ?? []) {
    const key = resolveBucketKey(new Date(order.created_at as string), buckets, granularity);
    if (!key) continue;
    const bucket = buckets.get(key)!;
    bucket.orders += 1;
    if (order.payment_status === "paid") bucket.revenue += Number(order.total ?? 0);
  }

  for (const user of usersRes.data ?? []) {
    const key = resolveBucketKey(new Date(user.created_at as string), buckets, granularity);
    if (!key) continue;
    buckets.get(key)!.users += 1;
  }

  const statusCounts = new Map<string, number>();
  for (const order of ordersRes.data ?? []) {
    const status = String(order.status ?? "pending");
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
  }

  const ordersByStatus: StatusBarPoint[] = Array.from(statusCounts.entries())
    .map(([label, value]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      value,
      colorClass: STATUS_COLORS[label] ?? "bg-gold",
    }))
    .sort((a, b) => b.value - a.value);

  const summary = {
    revenue: Array.from(buckets.values()).reduce((s, b) => s + b.revenue, 0),
    orders: Array.from(buckets.values()).reduce((s, b) => s + b.orders, 0),
    users: Array.from(buckets.values()).reduce((s, b) => s + b.users, 0),
  };

  return {
    rangeDays: days,
    metric,
    granularity,
    series: bucketsToSeries(buckets, metric),
    usersSeries: bucketsToSeries(buckets, "users"),
    ordersByStatus,
    summary,
  };
}

export async function getRecentDashboardOrders() {
  return getRecentOrders();
}
