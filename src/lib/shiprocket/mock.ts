import type { ShiprocketTrackingResponse } from "@/types/shiprocket";
import { SHIPROCKET_MOCK } from "@/constants/shipping";

export function isShiprocketMockEnabled(): boolean {
  return process.env.SHIPROCKET_MOCK_AWB === "true";
}

export function isMockAwb(awb: string): boolean {
  const upper = awb.toUpperCase();
  return (
    upper.startsWith(SHIPROCKET_MOCK.AWB_PREFIX) ||
    upper.startsWith(SHIPROCKET_MOCK.LEGACY_TEST_PREFIX)
  );
}

export function buildMockAwbFields(orderId: string) {
  const shortId = orderId.replace(/-/g, "").slice(0, 8).toUpperCase();
  const awbCode = `${SHIPROCKET_MOCK.AWB_PREFIX}${shortId}`;

  return {
    awb_code: awbCode,
    courier_name: SHIPROCKET_MOCK.COURIER_NAME,
    tracking_url: `${SHIPROCKET_MOCK.TRACKING_BASE_URL}${encodeURIComponent(awbCode)}`,
  };
}

/** @deprecated Use buildMockAwbFields — keeps real Shiprocket IDs separate */
export function buildMockShipment(orderId: string) {
  const shortId = orderId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return {
    shiprocket_order_id: `mock-order-${shortId}`,
    shiprocket_shipment_id: `mock-shipment-${shortId}`,
    ...buildMockAwbFields(orderId),
  };
}

export function buildMockTrackingResponse(): ShiprocketTrackingResponse {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 86_400_000);

  const format = (date: Date) =>
    date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return {
    tracking_data: {
      track_status: 1,
      shipment_status: "In Transit",
      shipment_track: [],
      shipment_track_activities: [
        {
          date: format(now),
          activity: "Order confirmed",
          location: "Gifwoods Warehouse",
        },
        {
          date: format(dayAgo),
          activity: "Being prepared for dispatch",
          location: "Gifwoods Warehouse",
        },
      ],
    },
  };
}
