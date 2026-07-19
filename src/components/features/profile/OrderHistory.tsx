"use client";

import { useEffect, useState } from "react";
import { formatPrice, formatDate, formatOrderId } from "@/lib/utils/formatters";
import { Download, ExternalLink, Loader2, Package, Truck, CheckCircle2 } from "lucide-react";
import type { Order } from "@/types/order";
import { Button } from "@/components/ui/button";

const STEPS = ["processing", "shipped", "delivered"] as const;

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/orders");
        const json = await res.json();
        if (json.data) setOrders(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const getStatusIndex = (status: string) => {
    if (status === "pending" || status === "paid" || status === "processing") return 0;
    if (status === "shipped") return 1;
    if (status === "delivered") return 2;
    return -1; // e.g. cancelled
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white text-center py-16 rounded-2xl border border-border">
        <Package className="w-12 h-12 text-warm-gray mx-auto mb-4" />
        <p className="text-warm-gray text-lg mb-2">No orders placed yet</p>
        <p className="text-muted-foreground text-sm">When you buy something, your orders will list here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold text-dark">Order History</h2>
      {orders.map((order) => {
        const statusIdx = getStatusIndex(order.status);
        return (
          <div key={order.id} className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border mb-6">
              <div>
                <span className="text-xs text-warm-gray font-semibold">ORDER ID</span>
                <h3 className="font-mono font-bold text-dark text-sm">{formatOrderId(order.id)}</h3>
                <p className="text-xs text-warm-gray mt-1">Placed on {formatDate(order.created_at)}</p>
              </div>
              <div className="flex flex-row gap-2">
                <Button variant="outline" size="sm" asChild className="gap-2 text-xs">
                  <a href={`/api/orders/${order.id}/invoice`} target="_blank" rel="noopener noreferrer">
                    <Download className="w-3.5 h-3.5" />
                    Invoice
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild className="gap-2 text-xs">
                  <a href={`/orders/${order.id}`}>
                    <ExternalLink className="w-3.5 h-3.5" />
                    Details
                  </a>
                </Button>
              </div>
            </div>

            {/* Items display */}
            <div className="space-y-4 mb-6">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-dark">{item.product?.name || "Product"}</p>
                    <p className="text-xs text-warm-gray">Qty: {item.quantity} × {formatPrice(item.unit_price)}</p>
                  </div>
                  <span className="font-semibold text-dark">{formatPrice(item.unit_price * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 border-t border-border/50 text-sm font-bold text-dark">
                <span>Total Amount</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Status Tracking Bar */}
            {order.status !== "cancelled" ? (
              <div className="mt-4 bg-cream rounded-xl p-4 border border-gold/10">
                <p className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-3">Order Tracking</p>
                <div className="flex items-center justify-between relative mt-2">
                  <div className="absolute left-0 right-0 h-1 bg-border -translate-y-1/2 top-1/2 z-0" />
                  <div
                    className="absolute left-0 h-1 bg-gold -translate-y-1/2 top-1/2 z-0 transition-all duration-500"
                    style={{ width: `${statusIdx === 0 ? "0%" : statusIdx === 1 ? "50%" : "100%"}` }}
                  />
                  {STEPS.map((step, idx) => {
                    const isCompleted = statusIdx >= idx;
                    const isActive = statusIdx === idx;
                    return (
                      <div key={step} className="flex flex-col items-center z-10">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                            isCompleted
                              ? "bg-gold border-gold text-dark"
                              : "bg-white border-border text-warm-gray"
                          } ${isActive ? "ring-4 ring-gold/20" : ""}`}
                        >
                          {idx === 0 && <Package className="w-4 h-4" />}
                          {idx === 1 && <Truck className="w-4 h-4" />}
                          {idx === 2 && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <span className={`text-[10px] sm:text-xs font-semibold capitalize mt-2 ${isActive ? "text-gold font-bold" : "text-warm-gray"}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 text-sm font-semibold text-center mt-4">
                This order was cancelled
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
