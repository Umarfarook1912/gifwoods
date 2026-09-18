import type { OrderStatus } from "@/types/order";
import type { ShiprocketTrackingResponse } from "@/types/shiprocket";

export const ORDER_STATUS_RANK: Record<OrderStatus, number> = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: 4,
};

/**
 * Map Shiprocket / courier status text to Gifwoods order status.
 * Uses includes() so variants like "Delivered - Delivered to consignee" match.
 */
export function mapShiprocketStatusToOrderStatus(raw: string): OrderStatus | null {
  const s = raw.trim().toUpperCase();
  if (!s) return null;

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
  const candidates = [
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

export function shouldAdvanceOrderStatus(
  current: OrderStatus,
  next: OrderStatus
): boolean {
  if (next === "cancelled") return current !== "cancelled" && current !== "delivered";
  return ORDER_STATUS_RANK[next] > ORDER_STATUS_RANK[current];
}
