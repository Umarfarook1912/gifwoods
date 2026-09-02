import { SITE_NAME } from "@/constants/ui";
import { getAdminEmail, sendEmail } from "@/lib/email/transporter";
import { buildCustomerOrderEmailHtml } from "@/lib/email/templates/order-email";
import {
  buildContactEmailHtml,
  buildOrderStatusEmailHtml,
  buildWelcomeEmailHtml,
} from "@/lib/email/templates/simple-emails";
import type { OrderEmailLineItem } from "@/types/email";

interface OrderConfirmationProps {
  to: string;
  userName: string | null;
  orderId: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  items: OrderEmailLineItem[];
  estimatedDeliveryDate?: string | null;
}

export async function sendOrderConfirmationEmail({
  to,
  userName,
  orderId,
  total,
  subtotal,
  shippingCost,
  items,
  estimatedDeliveryDate,
}: OrderConfirmationProps) {
  const name = userName ?? "Valued Customer";

  await sendEmail({
    to,
    toName: name,
    subject: `Order confirmed — ${SITE_NAME}`,
    html: buildCustomerOrderEmailHtml({
      orderId,
      customerName: userName,
      customerEmail: to,
      items,
      subtotal,
      shippingCost,
      total,
      estimatedDeliveryDate,
    }),
  });
}

interface OrderStatusProps {
  to: string;
  userName: string | null;
  orderId: string;
  status: string;
  trackingUrl?: string | null;
}

export async function sendOrderStatusEmail({
  to,
  userName,
  orderId,
  status,
  trackingUrl,
}: OrderStatusProps) {
  const name = userName ?? "Valued Customer";
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  const STATUS_MESSAGES: Record<string, string> = {
    processing: "Your order is being crafted by our artisans.",
    shipped: "Your gift is on its way to you!",
    delivered: "Your gift has been delivered. We hope it brings joy!",
    cancelled: "Your order has been cancelled. If you have questions, please contact us.",
  };

  const message =
    STATUS_MESSAGES[status] ?? `Your order status has been updated to: ${status}`;

  await sendEmail({
    to,
    toName: name,
    subject: `Order update — ${statusLabel} | ${SITE_NAME}`,
    html: buildOrderStatusEmailHtml({
      userName,
      orderId,
      status,
      message,
      trackingUrl,
    }),
  });
}

interface WelcomeEmailProps {
  to: string;
  userName: string | null;
}

export async function sendWelcomeEmail({ to, userName }: WelcomeEmailProps) {
  const name = userName ?? "Gifter";

  await sendEmail({
    to,
    toName: name,
    subject: `Welcome to ${SITE_NAME}`,
    html: buildWelcomeEmailHtml({ userName }),
  });
}

interface ContactEmailProps {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export async function sendContactEmail({
  name,
  email,
  phone,
  message,
}: ContactEmailProps) {
  await sendEmail({
    to: getAdminEmail(),
    replyTo: email,
    subject: `New contact message — ${SITE_NAME}`,
    html: buildContactEmailHtml({ name, email, phone, message }),
  });
}
