import { NextResponse } from "next/server";
import { sendOrderStatusEmail } from "@/lib/email/nodemailer";
import type { OrderStatus } from "@/types/order";
import {
  getOrderByAwb,
  getOrderByIdForDeliveryWebhook,
  getOrderByShiprocketOrderId,
  updateOrderDeliveryStatus,
  updateOrderShipmentFields,
} from "@/lib/db/orders";
import { buildShiprocketTrackingUrl } from "@/lib/orders/apply-shipment";
import {
  mapShiprocketStatusToOrderStatus,
  shouldAdvanceOrderStatus,
} from "@/lib/orders/shiprocket-status";

interface ShiprocketWebhookPayload {
  awb?: string;
  courier_name?: string;
  current_status?: string;
  current_status_id?: number;
  shipment_status?: string;
  order_id?: string | number;
  sr_order_id?: string | number;
  etd?: string;
}

async function resolveOrder(
  body: ShiprocketWebhookPayload
): Promise<Record<string, unknown> | null> {
  const awbCode = body.awb?.trim();
  if (awbCode) {
    const byAwb = await getOrderByAwb(awbCode);
    if (byAwb) return byAwb;
  }

  const channelOrderId = body.order_id != null ? String(body.order_id).trim() : "";
  if (channelOrderId) {
    const byId = await getOrderByIdForDeliveryWebhook(channelOrderId);
    if (byId) return byId;
  }

  const srOrderId = body.sr_order_id != null ? String(body.sr_order_id).trim() : "";
  if (srOrderId) {
    return getOrderByShiprocketOrderId(srOrderId);
  }

  return null;
}

export async function POST(request: Request) {
  let body: ShiprocketWebhookPayload;
  try {
    body = (await request.json()) as ShiprocketWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const awbCode = body.awb?.trim();
  if (!awbCode) {
    return NextResponse.json({ error: "Missing awb" }, { status: 400 });
  }

  const order = await resolveOrder(body);
  if (!order) {
    console.warn(
      `Delivery webhook: order not found for AWB ${awbCode}, order_id=${body.order_id}, sr_order_id=${body.sr_order_id}`
    );
    return NextResponse.json({ received: true });
  }

  const orderId = order.id as string;
  let trackingUrl = (order.tracking_url as string | null) ?? null;

  if (!order.awb_code) {
    trackingUrl = buildShiprocketTrackingUrl(awbCode);
    try {
      await updateOrderShipmentFields(orderId, {
        awb_code: awbCode,
        courier_name: body.courier_name ?? null,
        tracking_url: trackingUrl,
      });
      order.awb_code = awbCode;
      order.tracking_url = trackingUrl;
    } catch (err) {
      console.error("Delivery webhook: AWB save failed", err);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
  }

  const srStatus = body.current_status ?? body.shipment_status ?? "";
  const newStatus = mapShiprocketStatusToOrderStatus(srStatus);
  if (!newStatus) {
    return NextResponse.json({ received: true });
  }

  const currentStatus = order.status as OrderStatus;
  if (!shouldAdvanceOrderStatus(currentStatus, newStatus)) {
    return NextResponse.json({ received: true });
  }

  try {
    await updateOrderDeliveryStatus(orderId, newStatus);
  } catch (err) {
    console.error("Delivery webhook: DB update failed", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const user = order.user as { name: string; email: string } | null;
  if (user?.email) {
    try {
      await sendOrderStatusEmail({
        to: user.email,
        userName: user.name,
        orderId,
        status: newStatus,
        trackingUrl: newStatus === "shipped" ? trackingUrl : null,
      });
    } catch (emailErr) {
      console.error("Delivery webhook: email failed", emailErr);
    }
  }

  return NextResponse.json({ received: true });
}
