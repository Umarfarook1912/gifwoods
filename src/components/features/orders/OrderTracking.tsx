"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Loader2,
  Package,
  Truck,
} from "lucide-react";
import { API_ENDPOINTS } from "@/constants/api";
import {
  SHIPROCKET_MOCK,
  TRACKING_COPY,
  TRACKING_EMPTY_LOCATIONS,
} from "@/constants/shipping";
import type { OrderStatus } from "@/types/order";
import type { ShiprocketTrackingActivity, ShiprocketTrackingResponse } from "@/types/shiprocket";

interface Props {
  orderId: string;
  awbCode: string;
  courierName: string | null | undefined;
  trackingUrl?: string | null;
  status: OrderStatus;
}

const STATUS_STEPS: { key: string; label: string; match: OrderStatus[] }[] = [
  { key: "ordered", label: "Order placed", match: ["pending", "processing", "shipped", "delivered", "cancelled"] },
  { key: "packed", label: "Being prepared", match: ["processing", "shipped", "delivered"] },
  { key: "shipped", label: "Dispatched", match: ["shipped", "delivered"] },
  { key: "delivery", label: "Out for delivery", match: ["delivered"] },
  { key: "done", label: "Delivered", match: ["delivered"] },
];

function isMockAwbClient(awb: string): boolean {
  const upper = awb.toUpperCase();
  return (
    upper.startsWith(SHIPROCKET_MOCK.AWB_PREFIX) ||
    upper.startsWith(SHIPROCKET_MOCK.LEGACY_TEST_PREFIX)
  );
}

function displayLocation(location: string | undefined): string | null {
  if (!location?.trim()) return null;
  if (TRACKING_EMPTY_LOCATIONS.has(location.trim().toLowerCase())) return null;
  return location.trim();
}

export function OrderTracking({
  orderId,
  awbCode,
  courierName,
  trackingUrl: _trackingUrl,
  status,
}: Props) {
  const [activities, setActivities] = useState<ShiprocketTrackingActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const isMock = isMockAwbClient(awbCode);
  const href = `${SHIPROCKET_MOCK.TRACKING_BASE_URL}${encodeURIComponent(awbCode)}`;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(API_ENDPOINTS.ORDER_TRACK(orderId));
        if (!res.ok) throw new Error("fetch failed");
        const json = (await res.json()) as {
          data: ShiprocketTrackingResponse | null;
          error: string | null;
        };
        const acts = json.data?.tracking_data?.shipment_track_activities ?? [];
        setActivities(acts);
      } catch {
        setFailed(true);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [orderId]);

  const metaLine = [courierName?.trim(), `${TRACKING_COPY.AWB_LABEL}: ${awbCode}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mb-6 bg-white rounded-2xl border border-border p-6">
      <div className="flex flex-wrap items-start gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-gold" />
          <h2 className="font-semibold text-dark">{TRACKING_COPY.SHIPMENT_TRACKING}</h2>
        </div>
        <span className="sm:ml-auto text-xs text-warm-gray">{metaLine}</span>
      </div>

      {!isMock && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-gold-dark"
        >
          {TRACKING_COPY.TRACK_YOUR_ORDER}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}

      {isMock && (
        <p className="mb-5 text-xs text-warm-gray">{TRACKING_COPY.MOCK_NOTE}</p>
      )}

      <div className="flex items-start gap-0 mb-6 overflow-x-auto pb-1">
        {STATUS_STEPS.map((step, i) => {
          const done = step.match.includes(status);
          return (
            <div key={step.key} className="flex-1 flex flex-col items-center gap-1 min-w-[3.5rem]">
              <div className="flex items-center w-full">
                {i > 0 && (
                  <div className={`flex-1 h-0.5 ${done ? "bg-gold" : "bg-border"}`} />
                )}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    done ? "bg-gold/15" : "bg-muted"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-gold" />
                  ) : (
                    <Circle className="h-4 w-4 text-warm-gray" />
                  )}
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      STATUS_STEPS[i + 1]?.match.includes(status) ? "bg-gold" : "bg-border"
                    }`}
                  />
                )}
              </div>
              <p
                className={`text-[10px] text-center leading-tight mt-1 ${
                  done ? "text-dark font-medium" : "text-warm-gray"
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-warm-gray">
          <Loader2 className="h-4 w-4 animate-spin text-gold" />
          {TRACKING_COPY.LOADING}
        </div>
      )}

      {!loading && failed && (
        <p className="text-sm text-warm-gray">{TRACKING_COPY.UNAVAILABLE}</p>
      )}

      {!loading && !failed && activities.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-warm-gray">
          <Package className="h-4 w-4" />
          {TRACKING_COPY.NO_EVENTS_YET}
        </div>
      )}

      {!loading && activities.length > 0 && (
        <div className="space-y-0 max-h-64 overflow-y-auto pr-1">
          {activities.map((act, i) => {
            const location = displayLocation(act.location);
            return (
              <div key={i} className="flex gap-3 text-sm">
                <div className="flex flex-col items-center gap-0 pt-1">
                  <div className="w-2 h-2 rounded-full bg-gold shrink-0" />
                  {i < activities.length - 1 && (
                    <div className="w-px flex-1 bg-border min-h-[1.5rem]" />
                  )}
                </div>
                <div className="pb-3">
                  <p className="font-medium text-dark leading-snug">{act.activity}</p>
                  {location && (
                    <p className="text-xs text-warm-gray mt-0.5">{location}</p>
                  )}
                  <p className="text-xs text-warm-gray mt-0.5">{act.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
