import { SITE_NAME } from "@/constants/ui";
import { wrapEmailLayout } from "@/lib/email/templates/order-email";

const DARK = "#16130f";
const GOLD = "#e5a93c";
const MUTED = "#8b7d6b";
const CREAM = "#faf7f2";
const BORDER = "#e8e0d8";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ctaButton(href: string, label: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
      <tr>
        <td align="center">
          <a href="${href}" style="display:inline-block;background:${GOLD};color:${DARK};text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:8px;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>`;
}

export function buildOrderStatusEmailHtml(options: {
  userName: string | null;
  orderId: string;
  status: string;
  message: string;
  trackingUrl?: string | null;
}): string {
  const name = escapeHtml(options.userName ?? "Valued Customer");
  const statusLabel = escapeHtml(
    options.status.charAt(0).toUpperCase() + options.status.slice(1)
  );
  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL}/orders/${options.orderId}`;

  const trackingBlock =
    options.trackingUrl
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;background:${CREAM};border:1px solid ${BORDER};border-radius:12px;">
        <tr>
          <td style="padding:14px 16px;color:${MUTED};font-size:13px;">Track shipment</td>
          <td style="padding:14px 16px;text-align:right;">
            <a href="${options.trackingUrl}" style="color:${GOLD};font-size:13px;font-weight:700;text-decoration:none;">Track your order →</a>
          </td>
        </tr>
      </table>`
      : "";

  return wrapEmailLayout({
    title: `Order update — ${statusLabel}`,
    preheader: options.message,
    bodyHtml: `
      <h1 style="margin:0 0 8px;color:${DARK};font-size:24px;font-weight:700;">Order update</h1>
      <p style="margin:0 0 12px;color:${MUTED};font-size:15px;line-height:1.6;">Dear ${name},</p>
      <p style="margin:0 0 20px;color:${MUTED};font-size:15px;line-height:1.6;">${escapeHtml(options.message)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};border:1px solid ${BORDER};border-radius:12px;">
        <tr>
          <td style="padding:14px 16px;color:${MUTED};font-size:13px;">Status</td>
          <td style="padding:14px 16px;color:${DARK};font-size:13px;font-weight:700;text-align:right;text-transform:capitalize;">${statusLabel}</td>
        </tr>
      </table>
      ${trackingBlock}
      ${ctaButton(orderUrl, "View your order")}
    `,
  });
}

export function buildWelcomeEmailHtml(options: {
  userName: string | null;
}): string {
  const name = escapeHtml(options.userName ?? "Gifter");
  const shopUrl = `${process.env.NEXT_PUBLIC_APP_URL}/shop`;

  return wrapEmailLayout({
    title: `Welcome to ${SITE_NAME}`,
    preheader: "Your first gift awaits.",
    bodyHtml: `
      <h1 style="margin:0 0 8px;color:${DARK};font-size:24px;font-weight:700;text-align:center;">Welcome, ${name}</h1>
      <p style="margin:0 auto 20px;max-width:420px;color:${MUTED};font-size:15px;line-height:1.6;text-align:center;">
        You’ve joined Gifwoods — premium personalized gifts crafted with care for every special moment.
      </p>
      ${ctaButton(shopUrl, "Explore collections")}
    `,
  });
}

export function buildContactEmailHtml(options: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): string {
  return wrapEmailLayout({
    title: "New contact message",
    preheader: `Message from ${options.name}`,
    bodyHtml: `
      <h1 style="margin:0 0 8px;color:${DARK};font-size:24px;font-weight:700;">New contact message</h1>
      <p style="margin:0 0 18px;color:${MUTED};font-size:14px;line-height:1.6;">A customer reached out through the website contact form.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};border:1px solid ${BORDER};border-radius:12px;">
        <tr>
          <td style="padding:12px 16px;color:${MUTED};font-size:13px;border-bottom:1px solid ${BORDER};">Name</td>
          <td style="padding:12px 16px;color:${DARK};font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid ${BORDER};">${escapeHtml(options.name)}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;color:${MUTED};font-size:13px;border-bottom:1px solid ${BORDER};">Email</td>
          <td style="padding:12px 16px;color:${DARK};font-size:13px;text-align:right;border-bottom:1px solid ${BORDER};">
            <a href="mailto:${escapeHtml(options.email)}" style="color:${DARK};text-decoration:none;">${escapeHtml(options.email)}</a>
          </td>
        </tr>
        ${
          options.phone
            ? `<tr>
          <td style="padding:12px 16px;color:${MUTED};font-size:13px;border-bottom:1px solid ${BORDER};">Phone</td>
          <td style="padding:12px 16px;color:${DARK};font-size:13px;text-align:right;border-bottom:1px solid ${BORDER};">
            <a href="tel:${escapeHtml(options.phone)}" style="color:${DARK};text-decoration:none;">${escapeHtml(options.phone)}</a>
          </td>
        </tr>`
            : ""
        }
        <tr>
          <td colspan="2" style="padding:14px 16px;">
            <div style="color:${MUTED};font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:8px;">Message</div>
            <div style="color:${DARK};font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(options.message)}</div>
          </td>
        </tr>
      </table>
      <p style="margin:18px 0 0;color:${MUTED};font-size:12px;line-height:1.5;">Tip: Reply directly to this email to respond to the customer.</p>
    `,
  });
}
