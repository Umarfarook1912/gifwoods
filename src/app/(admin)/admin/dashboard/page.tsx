import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, Users, Star, Package, TrendingUp } from "lucide-react";
import { AdminAnalyticsPanel } from "@/components/features/admin/AdminAnalyticsPanel";
import { OrderStatusBadges } from "@/components/shared/OrderStatusBadges";
import { DASHBOARD_COPY } from "@/constants/ui";
import { ROUTES } from "@/constants/routes";
import {
  getAnalyticsSeries,
  getDashboardKpis,
  getRecentDashboardOrders,
} from "@/lib/admin/dashboard-stats";
import { formatPrice } from "@/lib/utils/formatters";
import { getOrderProductSummary } from "@/lib/orders/display";
import type { OrderStatusSummary } from "@/lib/orders/status";
import type { Order } from "@/types/order";

export const metadata: Metadata = { title: "Admin Dashboard" };
export const dynamic = "force-dynamic";

const KPI_ICONS = {
  orders: ShoppingBag,
  revenue: TrendingUp,
  products: Package,
  users: Users,
  reviews: Star,
} as const;

export default async function AdminDashboardPage() {
  const [kpis, analytics, recentOrders] = await Promise.all([
    getDashboardKpis(),
    getAnalyticsSeries(7, "revenue"),
    getRecentDashboardOrders(),
  ]);

  const kpiCards = [
    { key: "orders" as const, label: "Total Orders", value: kpis.orders, href: ROUTES.ADMIN.ORDERS },
    {
      key: "revenue" as const,
      label: "Total Revenue",
      value: formatPrice(kpis.totalRevenue),
      href: ROUTES.ADMIN.ORDERS,
    },
    {
      key: "products" as const,
      label: "Active Products",
      value: kpis.products,
      href: ROUTES.ADMIN.PRODUCTS,
    },
    { key: "users" as const, label: "Total Users", value: kpis.users, href: ROUTES.ADMIN.USERS },
    {
      key: "reviews" as const,
      label: "Pending Reviews",
      value: kpis.pendingReviews,
      href: ROUTES.ADMIN.REVIEWS,
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-dark">{DASHBOARD_COPY.TITLE}</h1>
        <p className="text-sm text-warm-gray mt-1">{DASHBOARD_COPY.SUBTITLE}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {kpiCards.map(({ key, label, value, href }) => {
          const Icon = KPI_ICONS[key];
          return (
            <Link
              key={label}
              href={href}
              className="group rounded-2xl border border-border bg-white p-4 shadow-sm hover:border-gold/50 hover:shadow-md transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center mb-3 group-hover:bg-gold/20 transition-colors">
                <Icon className="h-4 w-4 text-gold-dark" />
              </div>
              <p className="font-bold text-xl text-dark tabular-nums">{value}</p>
              <p className="text-xs text-warm-gray mt-0.5">{label}</p>
            </Link>
          );
        })}
      </div>

      <AdminAnalyticsPanel initialData={analytics} />

      <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
        <div className="p-4 md:p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-dark">{DASHBOARD_COPY.RECENT_TITLE}</h2>
          <Link href={ROUTES.ADMIN.ORDERS} className="text-sm text-gold hover:underline">
            {DASHBOARD_COPY.VIEW_ALL}
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentOrders.length === 0 ? (
            <p className="p-8 text-center text-sm text-warm-gray">{DASHBOARD_COPY.EMPTY_RECENT}</p>
          ) : (
            recentOrders.map((order) => {
              const user = order.user as { name?: string; email?: string } | null;
              return (
                <div key={order.id} className="p-4 md:px-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-dark truncate">
                      {getOrderProductSummary(order as unknown as Order)}
                    </p>
                    <p className="text-xs text-warm-gray mt-0.5">
                      {user?.name ?? user?.email ?? "Guest"} ·{" "}
                      {new Date(order.created_at as string).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold tabular-nums">
                      {formatPrice(order.total as number)}
                    </span>
                    <OrderStatusBadges
                      order={order as unknown as OrderStatusSummary}
                      compact
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
