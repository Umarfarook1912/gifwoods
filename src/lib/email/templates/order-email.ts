import { SITE_NAME, SITE_TAGLINE } from "@/constants/ui";
import { formatOrderId, formatPrice } from "@/lib/utils/formatters";
import type { OrderEmailLineItem, OrderEmailPayload } from "@/types/email";

const COLORS = {
  bg: "#f4f1ec",
  card: "#ffffff",
  dark: "#16130f",
  gold: "#e5a93c",
  muted: "#8b7d6b",
  border: "#e8e0d8",
  cream: "#faf7f2",
} as const;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function itemRows(items: OrderEmailLineItem[]): string {
  if (items.length === 0) {
    return `
      <tr>
        <td colspan="3" style="padding:12px 14px;color:${COLORS.muted};font-size:13px;border-top:1px solid ${COLORS.border};">
          Items will appear on your order page.
        </td>
      </tr>`;
  }

  return items
    .map(
      (item, index) => `
      <tr style="background:${index % 2 === 0 ? COLORS.card : COLORS.cream};">
        <td style="padding:12px 14px;border-top:1px solid ${COLORS.border};color:${COLORS.dark};font-size:13px;line-height:1.4;">
          ${escapeHtml(item.name)}
        </td>
        <td style="padding:12px 14px;border-top:1px solid ${COLORS.border};color:${COLORS.muted};font-size:13px;text-align:center;white-space:nowrap;">
          ${item.quantity}
        </td>
        <td style="padding:12px 14px;border-top:1px solid ${COLORS.border};color:${COLORS.dark};font-size:13px;text-align:right;white-space:nowrap;font-weight:600;">
          ${formatPrice(item.lineTotal)}
        </td>
      </tr>`
    )
    .join("");
}

export function buildOrderItemsTable(items: OrderEmailLineItem[]): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${COLORS.border};border-radius:12px;overflow:hidden;border-collapse:separate;">
      <thead>
        <tr style="background:${COLORS.cream};">
          <th align="left" style="padding:12px 14px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${COLORS.muted};font-weight:700;">Item</th>
          <th align="center" style="padding:12px 14px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${COLORS.muted};font-weight:700;">Qty</th>
          <th align="right" style="padding:12px 14px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${COLORS.muted};font-weight:700;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows(items)}
      </tbody>
    </table>`;
}

export function buildTotalsTable(payload: OrderEmailPayload): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-collapse:collapse;">
      <tr>
        <td style="padding:6px 0;color:${COLORS.muted};font-size:14px;">Subtotal</td>
        <td style="padding:6px 0;color:${COLORS.dark};font-size:14px;text-align:right;">${formatPrice(payload.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:${COLORS.muted};font-size:14px;">Shipping</td>
        <td style="padding:6px 0;color:${COLORS.dark};font-size:14px;text-align:right;">${payload.shippingCost === 0 ? "Free" : formatPrice(payload.shippingCost)}</td>
      </tr>
      <tr>
        <td style="padding:12px 0 0;border-top:1px solid ${COLORS.border};color:${COLORS.dark};font-size:15px;font-weight:700;">Total paid</td>
        <td style="padding:12px 0 0;border-top:1px solid ${COLORS.border};color:${COLORS.gold};font-size:18px;font-weight:700;text-align:right;">${formatPrice(payload.total)}</td>
      </tr>
    </table>`;
}

export function wrapEmailLayout(options: {
  title: string;
  preheader?: string;
  bodyHtml: string;
}): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${escapeHtml(options.title)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.bg};font-family:Arial,Helvetica,sans-serif;">
  ${options.preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(options.preheader)}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${COLORS.card};border:1px solid ${COLORS.border};border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:${COLORS.dark};padding:28px 32px;text-align:center;">
              <div style="color:${COLORS.gold};font-size:28px;font-weight:700;letter-spacing:0.02em;">${SITE_NAME}</div>
              <div style="color:rgba(255,255,255,0.65);font-size:12px;margin-top:6px;">${SITE_TAGLINE}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px;">
              ${options.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="background:${COLORS.cream};border-top:1px solid ${COLORS.border};padding:18px 28px;text-align:center;">
              <p style="margin:0;color:${COLORS.muted};font-size:12px;line-height:1.5;">© ${year} ${SITE_NAME}. Crafted with care in India.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildCustomerOrderEmailHtml(payload: OrderEmailPayload): string {
  const shortId = formatOrderId(payload.orderId);
  const name = escapeHtml(payload.customerName ?? "Valued Customer");
  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL}/orders/${payload.orderId}`;
  const deliveryRow = payload.estimatedDeliveryDate
    ? `<tr>
          <td style="padding:0 16px 14px;color:${COLORS.muted};font-size:13px;">Est. delivery</td>
          <td style="padding:0 16px 14px;color:${COLORS.gold};font-size:13px;font-weight:700;text-align:right;">${escapeHtml(payload.estimatedDeliveryDate)}</td>
        </tr>`
    : "";

  return wrapEmailLayout({
    title: "Order confirmed",
    preheader: "Your Gifwoods order is confirmed.",
    bodyHtml: `
      <h1 style="margin:0 0 8px;color:${COLORS.dark};font-size:24px;font-weight:700;">Order confirmed</h1>
      <p style="margin:0 0 18px;color:${COLORS.muted};font-size:15px;line-height:1.6;">Dear ${name}, thank you for your order. Our team has started preparing your gifts.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;background:${COLORS.cream};border:1px solid ${COLORS.border};border-radius:12px;">
        <tr>
          <td style="padding:14px 16px;color:${COLORS.muted};font-size:13px;">Order ID</td>
          <td style="padding:14px 16px;color:${COLORS.dark};font-size:13px;font-weight:700;text-align:right;">${shortId}</td>
        </tr>
        <tr>
          <td style="padding:0 16px 14px;color:${COLORS.muted};font-size:13px;">Payment</td>
          <td style="padding:0 16px 14px;color:#15803d;font-size:13px;font-weight:700;text-align:right;">Paid</td>
        </tr>
        ${deliveryRow}
      </table>
      ${buildOrderItemsTable(payload.items)}
      ${buildTotalsTable(payload)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
        <tr>
          <td align="center">
            <a href="${orderUrl}" style="display:inline-block;background:${COLORS.gold};color:${COLORS.dark};text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:8px;">
              View your order
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:22px 0 0;color:${COLORS.muted};font-size:13px;line-height:1.6;">You’ll get another email when your order ships. Reply to this message if you need help.</p>
    `,
  });
}

export function buildAdminOrderEmailHtml(payload: OrderEmailPayload): string {
  const shortId = formatOrderId(payload.orderId);
  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL}/orders/${payload.orderId}`;

  return wrapEmailLayout({
    title: "New paid order",
    preheader: `New paid order from ${payload.customerEmail}`,
    bodyHtml: `
      <h1 style="margin:0 0 8px;color:${COLORS.dark};font-size:24px;font-weight:700;">New paid order</h1>
      <p style="margin:0 0 18px;color:${COLORS.muted};font-size:15px;line-height:1.6;">A customer payment was completed successfully.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;background:${COLORS.cream};border:1px solid ${COLORS.border};border-radius:12px;">
        <tr>
          <td style="padding:12px 16px;color:${COLORS.muted};font-size:13px;border-bottom:1px solid ${COLORS.border};">Order</td>
          <td style="padding:12px 16px;color:${COLORS.dark};font-size:13px;font-weight:700;text-align:right;border-bottom:1px solid ${COLORS.border};">${shortId}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;color:${COLORS.muted};font-size:13px;border-bottom:1px solid ${COLORS.border};">Customer</td>
          <td style="padding:12px 16px;color:${COLORS.dark};font-size:13px;text-align:right;border-bottom:1px solid ${COLORS.border};">${escapeHtml(payload.customerName ?? "Customer")}<br/><span style="color:${COLORS.muted};">${escapeHtml(payload.customerEmail)}</span></td>
        </tr>
        <tr>
          <td style="padding:12px 16px;color:${COLORS.muted};font-size:13px;">Payment ID</td>
          <td style="padding:12px 16px;color:${COLORS.dark};font-size:13px;text-align:right;word-break:break-all;">${escapeHtml(payload.paymentId ?? "—")}</td>
        </tr>
      </table>
      ${buildOrderItemsTable(payload.items)}
      ${buildTotalsTable(payload)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
        <tr>
          <td align="center">
            <a href="${orderUrl}" style="display:inline-block;background:${COLORS.gold};color:${COLORS.dark};text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:8px;">
              Open order in admin
            </a>
          </td>
        </tr>
      </table>
    `,
  });
}
