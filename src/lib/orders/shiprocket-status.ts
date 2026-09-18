import type { OrderStatus } from "@/types/order";
import type { ShiprocketTrackingResponse } from "@/types/shiprocket";

export const ORDER_STATUS_RANK: Record<OrderStatus, number> = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: 4,
};

/** Shiprocket numeric shipment_status codes → Gifwoods order status. */
const SR_STATUS_CODE_MAP: Record<number, OrderStatus> = {
  6: "shipped",
  7: "delivered",
  8: "cancelled",
  9: "cancelled",
  10: "cancelled",
  14: "cancelled",
  17: "shipped",
  18: "shipped",
  38: "shipped",
};

/**
 * Map Shiprocket / courier status text (or numeric code) to Gifwoods order status.
 * Uses includes() so variants like "Delivered - Delivered to consignee" match.
 */
export function mapShiprocketStatusToOrderStatus(raw: unknown): OrderStatus | null {
  if (raw == null) return null;

  if (typeof raw === "number" && Number.isFinite(raw)) {
    return SR_STATUS_CODE_MAP[raw] ?? null;
  }

  const s = String(raw).trim().toUpperCase();
  if (!s || s === "UNDEFINED" || s === "NULL") return null;

  const asCode = Number(s);
  if (Number.isInteger(asCode) && SR_STATUS_CODE_MAP[asCode]) {
    return SR_STATUS_CODE_MAP[asCode];
  }

  if (s.includes("RTO")) return "cancelled";
  if (s.includes("DELIVERED")) return "delivered";
  if (
    s.includes("OUT FOR DELIVERY") ||
    s.includes("OFD") ||
    s.includes("IN TRANSIT") ||
    s.includes("PICKED UP") ||
    s.includes("PICKUP") ||
    s.includes("DISPATCHED") ||
    s.includes("SHIPPED")
  ) {
    return "shipped";
  }

  return null;
}

/** Highest fulfillment status inferred from live Shiprocket tracking payload. */
export function inferOrderStatusFromTracking(
  tracking: ShiprocketTrackingResponse
): OrderStatus | null {
  const td = tracking.tracking_data;
  const candidates: unknown[] = [
    td.shipment_status,
    ...(td.shipment_track_activities ?? []).flatMap((a) => [a.activity, a.sr_status ?? ""]),
    ...(td.shipment_track ?? []).flatMap((a) => [a.activity, a.sr_status ?? ""]),
  ];

  let best: OrderStatus | null = null;
  for (const candidate of candidates) {
    const mapped = mapShiprocketStatusToOrderStatus(candidate);
    if (!mapped) continue;
    if (!best || ORDER_STATUS_RANK[mapped] > ORDER_STATUS_RANK[best]) {
      best = mapped;
    }
  }
  return best;
}

/** First delivered scan date from live tracking activities, if present. */
export function getDeliveredAtFromTracking(
  tracking: ShiprocketTrackingResponse
): string | null {
  const acts = [
    ...(tracking.tracking_data?.shipment_track_activities ?? []),
    ...(tracking.tracking_data?.shipment_track ?? []),
  ];
  for (const act of acts) {
    if (mapShiprocketStatusToOrderStatus(act.activity) === "delivered" && act.date?.trim()) {
      return act.date.trim();
    }
  }
  return null;
}

export function shouldAdvanceOrderStatus(
  current: OrderStatus,
  next: OrderStatus
): boolean {
  if (next === "cancelled") return current !== "cancelled" && current !== "delivered";
  return ORDER_STATUS_RANK[next] > ORDER_STATUS_RANK[current];
}
