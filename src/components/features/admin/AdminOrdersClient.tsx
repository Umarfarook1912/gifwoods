"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { DataTable } from "./DataTable";
import { OrderStatusDialog } from "./OrderStatusDialog";
import { OrderStatusBadges } from "@/components/shared/OrderStatusBadges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice, formatDate } from "@/lib/utils/formatters";
import { getOrderProductSummary } from "@/lib/orders/display";
import { ROUTES } from "@/constants/routes";
import { Eye, ListRestart, Search } from "lucide-react";
import { ORDER_STATUSES } from "@/constants/ui";
import type { Order, OrderStatus } from "@/types/order";
import type { UserProfile } from "@/types/user";

interface Props {
  initialOrders: Order[];
}

export function AdminOrdersClient({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusOrder, setStatusOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const user = o.user as UserProfile | null;
      if (search) {
        const q = search.toLowerCase();
        if (
          !o.id.toLowerCase().includes(q) &&
          !getOrderProductSummary(o).toLowerCase().includes(q) &&
          !user?.email?.toLowerCase().includes(q) &&
          !user?.name?.toLowerCase().includes(q)
        )
          return false;
      }
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      return true;
    });
  }, [orders, search, statusFilter]);

  const paginated = useMemo(() => {
    const limit = 15;
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page]);

  const handleStatusUpdated = (orderId: string, status: OrderStatus) => {
    setOrders((current) =>
      current.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-display text-2xl font-bold text-dark mb-6">Orders</h1>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by ID, name, email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={[
          { key: "product", label: "Product", render: (o) => (
            <span className="text-sm font-semibold text-dark">
              {getOrderProductSummary(o)}
            </span>
          )},
          { key: "user", label: "Customer", render: (o) => {
            const user = o.user as UserProfile | null;
            return <div><p className="text-sm font-medium">{user?.name ?? "—"}</p><p className="text-xs text-warm-gray">{user?.email}</p></div>;
          }},
          { key: "total", label: "Total", render: (o) => <span className="font-semibold">{formatPrice(o.total)}</span> },
          { key: "status", label: "Statuses", render: (o) => (
            <OrderStatusBadges order={o} compact className="min-w-44" />
          )},
          { key: "created_at", label: "Date", render: (o) => <span className="text-xs text-warm-gray">{formatDate(o.created_at)}</span> },
          { key: "actions", label: "", render: (o) => (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="View full order details"
                asChild
              >
                <Link href={ROUTES.ORDER_DETAIL(o.id)}>
                  <Eye className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gold hover:text-gold-dark"
                title="Update order status"
                onClick={() => setStatusOrder(o)}
              >
                <ListRestart className="h-3.5 w-3.5" />
              </Button>
            </div>
          )},
        ]}
        data={paginated}
        keyExtractor={(o) => o.id}
        total={filtered.length}
        page={page}
        limit={15}
        onPageChange={setPage}
        emptyMessage="No orders found"
      />

      <OrderStatusDialog
        order={statusOrder}
        onClose={() => setStatusOrder(null)}
        onUpdated={handleStatusUpdated}
      />
    </div>
  );
}
