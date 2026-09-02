"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, PackageCheck, Truck } from "lucide-react";
import { API_ENDPOINTS } from "@/constants/api";
import { APP_ERRORS } from "@/constants/errors";
import { toUserErrorMessage } from "@/lib/errors/user-message";
import type { ShiprocketTrackingResponse, ShiprocketTrackingActivity } from "@/types/shiprocket";

interface Props {
  orderId: string | null;
  awbCode: string | null;
  onClose: () => void;
}

export function ShipmentTrackDialog({ orderId, awbCode, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<ShiprocketTrackingActivity[]>([]);
  const [shipmentStatus, setShipmentStatus] = useState<string>("");
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = Boolean(orderId);

  async function fetchTracking() {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINTS.ORDER_TRACK(orderId));
      const json = (await res.json()) as { data: ShiprocketTrackingResponse | null; error: string | null };
      if (!res.ok || !json.data) {
        setError(toUserErrorMessage(json.error, APP_ERRORS.TRACKING_LOAD_FAILED));
        return;
      }
      const td = json.data.tracking_data;
      setShipmentStatus(td.shipment_status ?? "");
      setActivities(
        td.shipment_track_activities ?? td.shipment_track ?? []
      );
      setFetched(true);
    } catch (err) {
      setError(toUserErrorMessage(err, APP_ERRORS.NETWORK));
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(val: boolean) {
    if (!val) {
      onClose();
      setFetched(false);
      setActivities([]);
      setShipmentStatus("");
      setError(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-gold" />
            Shipment Tracking
          </DialogTitle>
        </DialogHeader>

        {awbCode && (
          <p className="text-xs text-warm-gray">
            AWB: <span className="font-mono font-semibold text-dark">{awbCode}</span>
          </p>
        )}

        {!fetched ? (
          <div className="flex justify-center py-4">
            <Button onClick={fetchTracking} disabled={loading}>
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading…</>
              ) : (
                <><MapPin className="h-4 w-4 mr-2" /> Load tracking</>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {shipmentStatus && (
              <Badge variant="outline" className="capitalize">
                {shipmentStatus}
              </Badge>
            )}
            {activities.length === 0 && (
              <p className="text-sm text-warm-gray text-center py-4">No activity yet</p>
            )}
            {activities.map((act, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gold mt-1 shrink-0" />
                  {i < activities.length - 1 && (
                    <div className="w-px flex-1 bg-border" />
                  )}
                </div>
                <div className="pb-3">
                  <p className="font-medium text-dark">{act.activity}</p>
                  {act.location && (
                    <p className="text-xs text-warm-gray">{act.location}</p>
                  )}
                  <p className="text-xs text-warm-gray mt-0.5">{act.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        {fetched && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={fetchTracking} disabled={loading}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PackageCheck className="h-3.5 w-3.5 mr-1" />}
              Refresh
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
