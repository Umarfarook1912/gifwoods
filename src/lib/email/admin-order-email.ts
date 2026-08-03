import { SITE_NAME } from "@/constants/ui";
import { getAdminEmail, sendEmail } from "@/lib/email/transporter";
import { buildAdminOrderEmailHtml } from "@/lib/email/templates/order-email";
import type { OrderEmailLineItem } from "@/types/email";

interface AdminOrderEmailProps {
  orderId: string;
  customerName: string | null;
  customerEmail: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  paymentId: string;
  items: OrderEmailLineItem[];
}

export async function sendAdminOrderEmail({
  orderId,
  customerName,
  customerEmail,
  total,
  subtotal,
  shippingCost,
  paymentId,
  items,
}: AdminOrderEmailProps): Promise<void> {
  await sendEmail({
    to: getAdminEmail(),
    subject: `New paid order — ${SITE_NAME}`,
    html: buildAdminOrderEmailHtml({
      orderId,
      customerName,
      customerEmail,
      items,
      subtotal,
      shippingCost,
      total,
      paymentId,
    }),
  });
}
