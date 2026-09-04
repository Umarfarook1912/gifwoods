import { SHIPROCKET_MOCK } from "@/constants/shipping";
import {
  updateOrderDeliveryStatus,
  updateOrderShipmentFields,
} from "@/lib/db/orders";
import type { OrderStatus } from "@/types/order";

const STATUS_RANK: Record<string, number> = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: 4,
};

export function buildShiprocketTrackingUrl(awbCode: string): string {
  return `${SHIPROCKET_MOCK.TRACKING_BASE_URL}${encodeURIComponent(awbCode)}`;
}

/** Persist AWB fields and advance status to shipped when allowed. */
export async function applyOrderShipment(
  orderId: string,
  currentStatus: OrderStatus | string,
  fields: { awb_code: string; courier_name: string | null }
): Promise<{
  awb_code: string;
  courier_name: string | null;
  tracking_url: string;
  status: string;
}> {
  const trackingUrl = buildShiprocketTrackingUrl(fields.awb_code);

  await updateOrderShipmentFields(orderId, {
    awb_code: fields.awb_code,
    courier_name: fields.courier_name,
    tracking_url: trackingUrl,
  });

  const currentRank = STATUS_RANK[currentStatus] ?? 0;
  const shouldShip = currentRank < STATUS_RANK.shipped;
  if (shouldShip) {
    await updateOrderDeliveryStatus(orderId, "shipped");
  }

  return {
    awb_code: fields.awb_code,
    courier_name: fields.courier_name,
    tracking_url: trackingUrl,
    status: shouldShip ? "shipped" : currentStatus,
  };
}
