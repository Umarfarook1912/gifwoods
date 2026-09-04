"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { API_ENDPOINTS } from "@/constants/api";
import { MANUAL_AWB_COPY } from "@/constants/shipping";
import { APP_ERRORS } from "@/constants/errors";
import { getOrderProductSummary } from "@/lib/orders/display";
import { toastError } from "@/lib/errors/toast";
import { toast } from "sonner";
import type { Order, OrderStatus } from "@/types/order";

interface SavedShipment {
  awb_code: string;
  courier_name: string | null;
  tracking_url: string;
  status: OrderStatus | string;
}

interface Props {
  order: Order | null;
  onClose: () => void;
  onSaved: (orderId: string, shipment: SavedShipment) => void;
}

export function ManualAwbDialog({ order, onClose, onSaved }: Props) {
  const [awbCode, setAwbCode] = useState("");
  const [courierName, setCourierName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setAwbCode("");
      setCourierName("");
    }
  }, [order]);

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);
    try {
      const res = await fetch(API_ENDPOINTS.ORDER_MANUAL_SHIPMENT(order.id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          awb_code: awbCode.trim(),
          courier_name: courierName.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error);
      onSaved(order.id, json.data as SavedShipment);
      toast.success(MANUAL_AWB_COPY.SUCCESS);
      onClose();
    } catch (error) {
      toastError(error, APP_ERRORS.SHIPMENT_SAVE_FAILED);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(order)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{MANUAL_AWB_COPY.TITLE}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-warm-gray">
          {order ? getOrderProductSummary(order) : ""} — {MANUAL_AWB_COPY.DESCRIPTION}
        </p>
        <div className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label htmlFor="manual-awb">{MANUAL_AWB_COPY.AWB_LABEL}</Label>
            <Input
              id="manual-awb"
              value={awbCode}
              onChange={(e) => setAwbCode(e.target.value)}
              placeholder={MANUAL_AWB_COPY.AWB_PLACEHOLDER}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manual-courier">{MANUAL_AWB_COPY.COURIER_LABEL}</Label>
            <Input
              id="manual-courier"
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
              placeholder={MANUAL_AWB_COPY.COURIER_PLACEHOLDER}
              autoComplete="off"
            />
          </div>
          <Button
            className="w-full bg-gold text-dark hover:bg-gold-dark font-semibold"
            onClick={handleSave}
            disabled={saving || awbCode.trim().length < 3}
          >
            {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
            {saving ? MANUAL_AWB_COPY.SAVING : MANUAL_AWB_COPY.SAVE}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
