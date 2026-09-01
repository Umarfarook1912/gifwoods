"use client";

import { useState, useMemo, useEffect } from "react";
import { DataTable } from "./DataTable";
import { OrderStatusDialog } from "./OrderStatusDialog";
import { OrderStatusBadges } from "@/components/shared/OrderStatusBadges";
import { ShipmentTrackDialog } from "./ShipmentTrackDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminOrderCustomization } from "./AdminOrderCustomization";
import { AdminCustomizationDialog } from "./AdminCustomizationDialog";
import { formatPrice, formatDate } from "@/lib/utils/formatters";
import { getOrderProductSummary } from "@/lib/orders/display";
import { Eye, ListRestart, Loader2, Search, Truck, Trash2 } from "lucide-react";
import { ORDER_STATUSES } from "@/constants/ui";
import { CUSTOMIZATION_COPY } from "@/constants/customization";
import { useConfirm } from "@/hooks/useConfirm";
import { CONFIRMATIONS } from "@/constants/confirmations";
import { API_ENDPOINTS } from "@/constants/api";
import { toast } from "sonner";
import type { Order, OrderStatus } from "@/types/order";
import type { UserProfile } from "@/types/user";

interface Props {
  initialOrders: Order[];
}

export function AdminOrdersClient({ initialOrders }: Props) {
  const confirm = useConfirm();
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusOrder, setStatusOrder] = useState<Order | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [trackOrder, setTrackOrder] = useState<Order | null>(null);
  const [pushingId, setPushingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

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

  const handleDeleteOrder = async (id: string) => {
    if (!(await confirm(CONFIRMATIONS.ORDER_DELETE))) return;
    try {
      const res = await fetch(API_ENDPOINTS.ORDER(id), { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || json.error) {
        toast.error(json.error ?? "Failed to delete order");
        return;
      }
      setOrders((prev) => prev.filter((o) => o.id !== id));
      toast.success("Order deleted permanently");
    } catch (err) {
      toast.error("Failed to delete order");
      console.error(err);
    }
  };

  const handlePushToShiprocket = async (order: Order) => {
    setPushingId(order.id);
    try {
      const res = await fetch(API_ENDPOINTS.ORDER_SHIPROCKET(order.id), {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        toast.error(json.error ?? "Failed to push to Shiprocket");
        return;
      }
      toast.success("Shipment created on Shiprocket");
    } catch {
      toast.error("Network error — could not push to Shiprocket");
    } finally {
      setPushingId(null);
    }
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
          { key: "product", label: "Product", className: "whitespace-normal max-w-[10rem] sm:max-w-[14rem]", render: (o) => (
            <span className="text-sm font-semibold text-dark line-clamp-2">
              {getOrderProductSummary(o)}
            </span>
          )},
          { key: "user", label: "Customer", className: "whitespace-normal", render: (o) => {
            const user = o.user as UserProfile | null;
            return <div><p className="text-sm font-medium">{user?.name ?? "—"}</p><p className="text-xs text-warm-gray break-all">{user?.email}</p></div>;
          }},
          { key: "total", label: "Total", render: (o) => <span className="font-semibold">{formatPrice(o.total)}</span> },
          { key: "shipment", label: "Shipment", render: (o) => (
            o.awb_code ? (
              <div className="text-xs">
                <p className="font-mono font-semibold text-dark">{o.awb_code}</p>
                {o.courier_name && <p className="text-warm-gray">{o.courier_name}</p>}
              </div>
            ) : (
              <span className="text-xs text-warm-gray">—</span>
            )
          )},
          { key: "customization", label: CUSTOMIZATION_COPY.COLUMN, render: (o) => (
            <AdminOrderCustomization items={o.order_items} />
          )},
          { key: "status", label: "Statuses", className: "whitespace-normal", render: (o) => (
            <OrderStatusBadges order={o} compact />
          )},
          { key: "created_at", label: "Date", render: (o) => <span className="text-xs text-warm-gray">{formatDate(o.created_at)}</span> },
          { key: "actions", label: "", render: (o) => (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title={CUSTOMIZATION_COPY.VIEW_DETAILS}
                onClick={() => setViewOrder(o)}
              >
                <Eye className="h-3.5 w-3.5" />
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
              {o.awb_code ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-blue-500 hover:text-blue-700"
                  title="Track shipment"
                  onClick={() => setTrackOrder(o)}
                >
                  <Truck className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:text-gold"
                  title="Push to Shiprocket"
                  disabled={pushingId === o.id}
                  onClick={() => handlePushToShiprocket(o)}
                >
                  {pushingId === o.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Truck className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-destructive"
                title="Delete order"
                onClick={() => handleDeleteOrder(o.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
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

      <AdminCustomizationDialog
        order={viewOrder}
        onClose={() => setViewOrder(null)}
      />
      <OrderStatusDialog
        order={statusOrder}
        onClose={() => setStatusOrder(null)}
        onUpdated={handleStatusUpdated}
      />
      <ShipmentTrackDialog
        orderId={trackOrder?.id ?? null}
        awbCode={trackOrder?.awb_code ?? null}
        onClose={() => setTrackOrder(null)}
      />
    </div>
  );
}
