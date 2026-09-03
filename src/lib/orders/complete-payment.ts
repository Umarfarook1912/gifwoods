import { sendOrderConfirmationEmail } from "@/lib/email/nodemailer";
import { sendAdminOrderEmail } from "@/lib/email/admin-order-email";
import { createShiprocketShipment } from "@/lib/shiprocket/create-shipment";
import { getShiprocketDeliveryEstimate } from "@/lib/shipping/delivery-estimate";
import type { OrderEmailLineItem } from "@/types/email";
import type { ShippingAddress } from "@/types/order";
import {
  getOrderForPaymentCompletion,
  updateOrderPayment,
  markOrderEmailSent,
} from "@/lib/db/orders";

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

export async function completePaidOrder(orderId: string, paymentId: string): Promise<void> {
  const raw = await getOrderForPaymentCompletion(orderId);
  if (!raw) throw new Error("Order not found");

  const order = raw as unknown as PaidOrder;
  if (order.status === "pending") order.status = "processing";

  await updateOrderPayment(orderId, {
    status: order.status,
    payment_status: "paid",
    payment_id: paymentId,
    payment_method: "cashfree",
  });

  // Sync order to Shiprocket as NEW only — admin assigns AWB via Shiprocket Ship Now
  try {
    await createShiprocketShipment(
      {
        id: order.id,
        subtotal: order.subtotal,
        total: order.total,
        shipping_address: order.shipping_address,
        order_items: order.order_items,
      },
      { mode: "sync" }
    );
  } catch (shiprocketError) {
    console.error("Shiprocket order sync failed:", shiprocketError);
  }

  if (!order.user?.email || order.confirmation_email_sent_at) return;

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

  const failures = results.filter((r) => r.status === "rejected");
  if (failures.length > 0) {
    failures.forEach((f) => console.error("Order email failed:", f));
    return;
  }

  await markOrderEmailSent(orderId);
}
