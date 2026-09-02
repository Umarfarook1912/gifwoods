import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderStatusEmail } from "@/lib/email/nodemailer";
import type { OrderStatus } from "@/types/order";

// Shiprocket status codes → our order statuses
const SR_STATUS_MAP: Record<string, OrderStatus> = {
  "PICKED UP": "shipped",
  "IN TRANSIT": "shipped",
  "OUT FOR DELIVERY": "shipped",
  DELIVERED: "delivered",
  RTO: "cancelled",
  "RTO DELIVERED": "cancelled",
};

interface ShiprocketWebhookPayload {
  awb?: string;
  current_status?: string;
  current_status_id?: number;
  shipment_status?: string;
  etd?: string;
}

export async function POST(request: Request) {
  let body: ShiprocketWebhookPayload;
  try {
    body = (await request.json()) as ShiprocketWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const awbCode = body.awb;
  const srStatus = (
    body.current_status ??
    body.shipment_status ??
    ""
  ).toUpperCase();

  if (!awbCode) {
    return NextResponse.json({ error: "Missing awb" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, status, tracking_url, user:profiles(name, email)")
    .eq("awb_code", awbCode)
    .single();

  if (fetchError || !order) {
    console.warn(`Delivery webhook: AWB ${awbCode} not found in DB`);
    return NextResponse.json({ received: true });
  }

  const newStatus = SR_STATUS_MAP[srStatus];
  if (!newStatus) {
    return NextResponse.json({ received: true });
  }

  const STATUS_RANK: Record<OrderStatus, number> = {
    pending: 0,
    processing: 1,
    shipped: 2,
    delivered: 3,
    cancelled: 4,
  };
  const currentRank = STATUS_RANK[order.status as OrderStatus] ?? 0;
  const newRank = STATUS_RANK[newStatus] ?? 0;
  if (newRank <= currentRank && newStatus !== "cancelled") {
    return NextResponse.json({ received: true });
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", order.id);

  if (updateError) {
    console.error("Delivery webhook: DB update failed", updateError);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const typedOrder = order as unknown as {
    id: string;
    status: string;
    tracking_url: string | null;
    user: { name: string; email: string } | null;
  };
  if (typedOrder.user?.email) {
    try {
      await sendOrderStatusEmail({
        to: typedOrder.user.email,
        userName: typedOrder.user.name,
        orderId: typedOrder.id,
        status: newStatus,
        trackingUrl: newStatus === "shipped" ? typedOrder.tracking_url : null,
      });
    } catch (emailErr) {
      console.error("Delivery webhook: email failed", emailErr);
    }
  }

  return NextResponse.json({ received: true });
}
