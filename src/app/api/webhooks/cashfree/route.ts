import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderConfirmationEmail } from "@/lib/email/nodemailer";
import type { CashfreeWebhookPayload } from "@/types/payment";

export async function POST(request: Request) {
  const body = await request.json() as CashfreeWebhookPayload;

  if (body.type !== "PAYMENT_SUCCESS_WEBHOOK") {
    return NextResponse.json({ received: true });
  }

  const { order, payment } = body.data;
  // Extract our DB order ID from the Cashfree order ID (GW_<8chars>)
  const cfOrderId = order.order_id;

  const supabase = createAdminClient();

  // Find order by payment session reference
  const { data: dbOrder } = await supabase
    .from("orders")
    .select("*, user:profiles(id, name, email)")
    .ilike("id", `${cfOrderId.replace("GW_", "").toLowerCase()}%`)
    .single();

  if (!dbOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (payment.payment_status === "SUCCESS") {
    await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_id: payment.cf_payment_id,
        payment_method: "cashfree",
      })
      .eq("id", dbOrder.id);

    const user = dbOrder.user as { name: string; email: string } | null;
    if (user?.email) {
      await sendOrderConfirmationEmail({
        to: user.email,
        userName: user.name,
        orderId: dbOrder.id,
        total: dbOrder.total,
      });
    }
  } else if (payment.payment_status === "FAILED") {
    await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", dbOrder.id);
  }

  return NextResponse.json({ received: true });
}
