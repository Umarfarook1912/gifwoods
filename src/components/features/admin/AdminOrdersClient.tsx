"use client";

import { useState, useMemo } from "react";
import { DataTable } from "./DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatPrice, formatDate, formatOrderId } from "@/lib/utils/formatters";
import { API_ENDPOINTS } from "@/constants/api";
import { toast } from "sonner";
import { Eye, Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ORDER_STATUSES } from "@/constants/ui";
import type { Order, OrderStatus } from "@/types/order";
import type { UserProfile } from "@/types/user";

interface Props {
  initialOrders: Order[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export function AdminOrdersClient({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>("pending");

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const user = o.user as UserProfile | null;
      if (search) {
        const q = search.toLowerCase();
        if (!o.id.toLowerCase().includes(q) && !user?.email?.toLowerCase().includes(q) && !user?.name?.toLowerCase().includes(q)) return false;
      }
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      return true;
    });
  }, [orders, search, statusFilter]);

  const handleViewOrder = (order: Order) => {
    setViewingOrder(order);
    setNewStatus(order.status);
  };

  const handleStatusUpdate = async () => {
    if (!viewingOrder) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(API_ENDPOINTS.ORDER(viewingOrder.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error);
      setOrders(orders.map((o) => o.id === viewingOrder.id ? { ...o, status: newStatus } : o));
      setViewingOrder({ ...viewingOrder, status: newStatus });
      toast.success("Order status updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdatingStatus(false);
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
          { key: "id", label: "Order ID", render: (o) => <span className="font-mono text-xs font-semibold">{formatOrderId(o.id)}</span> },
          { key: "user", label: "Customer", render: (o) => {
            const user = o.user as UserProfile | null;
            return <div><p className="text-sm font-medium">{user?.name ?? "—"}</p><p className="text-xs text-warm-gray">{user?.email}</p></div>;
          }},
          { key: "total", label: "Total", render: (o) => <span className="font-semibold">{formatPrice(o.total)}</span> },
          { key: "status", label: "Status", render: (o) => (
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full capitalize", STATUS_COLORS[o.status])}>
              {o.status}
            </span>
          )},
          { key: "created_at", label: "Date", render: (o) => <span className="text-xs text-warm-gray">{formatDate(o.created_at)}</span> },
          { key: "actions", label: "", render: (o) => (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewOrder(o)}>
              <Eye className="h-3.5 w-3.5" />
            </Button>
          )},
        ]}
        data={filtered}
        keyExtractor={(o) => o.id}
        total={filtered.length}
        emptyMessage="No orders found"
      />

      {/* View/Edit Order Dialog */}
      <Dialog open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order {viewingOrder && formatOrderId(viewingOrder.id)}</DialogTitle>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-warm-gray text-xs">Date</p>
                  <p className="font-medium">{formatDate(viewingOrder.created_at)}</p>
                </div>
                <div>
                  <p className="text-warm-gray text-xs">Total</p>
                  <p className="font-bold text-gold">{formatPrice(viewingOrder.total)}</p>
                </div>
              </div>
              <div>
                <p className="text-warm-gray text-xs mb-2">Update Status</p>
                <div className="flex gap-3">
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as OrderStatus)}>
                    <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button className="bg-gold text-dark hover:bg-gold-dark font-semibold" onClick={handleStatusUpdate} disabled={updatingStatus}>
                    Update
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
