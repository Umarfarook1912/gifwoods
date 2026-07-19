"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_ENDPOINTS } from "@/constants/api";
import { FULFILLMENT_STATUSES } from "@/constants/ui";
import { getOrderProductSummary } from "@/lib/orders/display";
import { toast } from "sonner";
import type { Order, OrderStatus } from "@/types/order";

interface Props {
  order: Order | null;
  onClose: () => void;
  onUpdated: (orderId: string, status: OrderStatus) => void;
}

export function OrderStatusDialog({ order, onClose, onUpdated }: Props) {
  const [status, setStatus] = useState<OrderStatus>("processing");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) setStatus(order.status);
  }, [order]);

  const updateStatus = async () => {
    if (!order) return;
    setSaving(true);
    try {
      const response = await fetch(API_ENDPOINTS.ORDER(order.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok || result.error) throw new Error(result.error);
      onUpdated(order.id, status);
      toast.success("Order status updated");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(order)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            Update {order ? getOrderProductSummary(order) : "order"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Select
            value={status}
            onValueChange={(value) => value && setStatus(value as OrderStatus)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FULFILLMENT_STATUSES.map((option) => (
                <SelectItem key={option} value={option} className="capitalize">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="w-full rounded-full bg-gold font-semibold text-dark hover:bg-gold-dark"
            onClick={updateStatus}
            disabled={saving || status === order?.status}
          >
            {saving && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Save status
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
