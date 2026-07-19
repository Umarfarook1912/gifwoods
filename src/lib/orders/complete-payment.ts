import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderConfirmationEmail } from "@/lib/email/nodemailer";
import { sendAdminOrderEmail } from "@/lib/email/admin-order-email";

interface OrderUser {
  name: string | null;
  email: string;
}

interface PaidOrder {
  id: string;
  status: string;
  total: number;
  confirmation_email_sent_at: string | null;
  user: OrderUser | null;
}

export async function completePaidOrder(
  orderId: string,
  paymentId: string
): Promise<void> {
  const supabase = createAdminClient();
  const { data: current, error: fetchError } = await supabase
    .from("orders")
    .select(
      "id, status, total, confirmation_email_sent_at, user:profiles(name, email)"
    )
    .eq("id", orderId)
    .single();

  if (fetchError || !current) throw new Error("Order not found");
  const order = current as unknown as PaidOrder;

  if (order.status === "pending") {
    order.status = "processing";
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: order.status,
      payment_status: "paid",
      payment_id: paymentId,
      payment_method: "cashfree",
    })
    .eq("id", orderId);
  if (error) throw new Error(error.message);

  if (!order.user?.email || order.confirmation_email_sent_at) return;

  const results = await Promise.allSettled([
    sendOrderConfirmationEmail({
      to: order.user.email,
      userName: order.user.name,
      orderId,
      total: order.total,
    }),
    sendAdminOrderEmail({
      orderId,
      customerName: order.user.name,
      customerEmail: order.user.email,
      total: order.total,
      paymentId,
    }),
  ]);

  const failures = results.filter((result) => result.status === "rejected");
  if (failures.length > 0) {
    failures.forEach((failure) => console.error("Order email failed:", failure));
    return;
  }

  await supabase
    .from("orders")
    .update({ confirmation_email_sent_at: new Date().toISOString() })
    .eq("id", orderId);
}
