import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderConfirmationEmail } from "@/lib/email/nodemailer";
import { sendAdminOrderEmail } from "@/lib/email/admin-order-email";
import { createShiprocketShipment } from "@/lib/shiprocket/create-shipment";
import { getShiprocketDeliveryEstimate } from "@/lib/shipping/delivery-estimate";
import type { OrderEmailLineItem } from "@/types/email";
import type { ShippingAddress } from "@/types/order";

interface OrderUser {
  name: string | null;
  email: string;
}

interface PaidOrderItem {
  quantity: number;
  unit_price: number;
  product: { name: string; customization_text?: boolean; customization_image?: boolean } | null;
}

interface PaidOrder {
  id: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  confirmation_email_sent_at: string | null;
  shipping_address: ShippingAddress;
  user: OrderUser | null;
  order_items: PaidOrderItem[] | null;
}

function mapEmailItems(items: PaidOrderItem[] | null): OrderEmailLineItem[] {
  return (items ?? []).map((item) => ({
    name: item.product?.name ?? "Product",
    quantity: item.quantity,
    unitPrice: Number(item.unit_price),
    lineTotal: Number(item.unit_price) * item.quantity,
  }));
}

export async function completePaidOrder(
  orderId: string,
  paymentId: string
): Promise<void> {
  const supabase = createAdminClient();
  const { data: current, error: fetchError } = await supabase
    .from("orders")
    .select(
      "id, status, subtotal, shipping_cost, total, confirmation_email_sent_at, shipping_address, user:profiles(name, email), order_items(quantity, unit_price, product:products(name, customization_text, customization_image))"
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

  // Auto-create Shiprocket shipment — failure does NOT block payment confirmation
  try {
    await createShiprocketShipment({
      id: order.id,
      subtotal: order.subtotal,
      total: order.total,
      shipping_address: order.shipping_address,
      order_items: order.order_items,
    });
  } catch (shiprocketError) {
    console.error("Shiprocket shipment creation failed:", shiprocketError);
  }

  if (!order.user?.email || order.confirmation_email_sent_at) return;

  // Calculate delivery estimate to include in confirmation email
  let estimatedDeliveryDate: string | null = null;
  const pincode = (order.shipping_address as { pincode?: string }).pincode;
  if (pincode) {
    try {
      const firstProduct = order.order_items?.[0]?.product;
      const estimate = await getShiprocketDeliveryEstimate({
        pincode,
        product: firstProduct ?? { customization_text: false, customization_image: false },
        pickupPostcode: process.env.SHIPROCKET_PICKUP_PINCODE ?? "",
        declaredValue: Number(order.total),
      });
      if (estimate.serviceable && estimate.formattedDate) {
        estimatedDeliveryDate = estimate.formattedDate;
      }
    } catch {
      // Non-blocking
    }
  }

  const items = mapEmailItems(order.order_items);
  const emailPayload = {
    orderId,
    customerName: order.user.name,
    customerEmail: order.user.email,
    items,
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shipping_cost),
    total: Number(order.total),
    paymentId,
  };

  const results = await Promise.allSettled([
    sendOrderConfirmationEmail({
      to: order.user.email,
      userName: order.user.name,
      estimatedDeliveryDate,
      ...emailPayload,
    }),
    sendAdminOrderEmail(emailPayload),
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
