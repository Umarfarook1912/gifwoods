import { NextResponse } from "next/server";
import {
  getDatabaseOrderId,
  verifyCashfreeWebhook,
} from "@/lib/payment/cashfree";
import { completePaidOrder } from "@/lib/orders/complete-payment";
import type { CashfreeWebhookPayload } from "@/types/payment";
import {
  findOrderIdByCashfreeRef,
  cancelOrderWithPaymentFailed,
} from "@/lib/db/orders";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const timestamp = request.headers.get("x-webhook-timestamp");
  const signature = request.headers.get("x-webhook-signature");

  if (!timestamp || !signature || !verifyCashfreeWebhook(rawBody, timestamp, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody) as CashfreeWebhookPayload;

  if (
    body.type !== "PAYMENT_SUCCESS_WEBHOOK" &&
    body.type !== "PAYMENT_FAILED_WEBHOOK"
  ) {
    return NextResponse.json({ received: true });
  }

  const { order, payment } = body.data;
  const candidateId = getDatabaseOrderId(order.order_id).toLowerCase();

  const dbOrder = await findOrderIdByCashfreeRef(candidateId);
  if (!dbOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (payment.payment_status === "SUCCESS") {
    await completePaidOrder(dbOrder.id, payment.cf_payment_id);
  } else if (payment.payment_status === "FAILED") {
    await cancelOrderWithPaymentFailed(dbOrder.id);
  }

  return NextResponse.json({ received: true });
}
