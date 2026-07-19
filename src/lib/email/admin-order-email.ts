import nodemailer from "nodemailer";
import { SITE_NAME } from "@/constants/ui";
import { formatOrderId, formatPrice } from "@/lib/utils/formatters";

interface AdminOrderEmailProps {
  orderId: string;
  customerName: string | null;
  customerEmail: string;
  total: number;
  paymentId: string;
}

export async function sendAdminOrderEmail({
  orderId,
  customerName,
  customerEmail,
  total,
  paymentId,
}: AdminOrderEmailProps): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT ?? "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? `${SITE_NAME} <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL ?? process.env.SMTP_USER,
    subject: `New paid order ${formatOrderId(orderId)} — ${SITE_NAME}`,
    text: [
      "A new paid order has been received.",
      `Order: ${formatOrderId(orderId)}`,
      `Customer: ${customerName ?? "Customer"} (${customerEmail})`,
      `Total: ${formatPrice(total)}`,
      `Cashfree payment ID: ${paymentId}`,
      `View: ${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}`,
    ].join("\n"),
  });
}
