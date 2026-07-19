import nodemailer from "nodemailer";
import { SITE_NAME } from "@/constants/ui";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT ?? "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

interface OrderConfirmationProps {
  to: string;
  userName: string | null;
  orderId: string;
  total: number;
}

export async function sendOrderConfirmationEmail({
  to,
  userName,
  orderId,
  total,
}: OrderConfirmationProps) {
  const transporter = createTransporter();
  const name = userName ?? "Valued Customer";
  const shortId = `#${orderId.slice(0, 8).toUpperCase()}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? `${SITE_NAME} <${process.env.SMTP_USER}>`,
    to,
    subject: `Order Confirmed ${shortId} — ${SITE_NAME}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"/></head>
      <body style="font-family: Georgia, serif; background: #faf7f2; margin: 0; padding: 40px 20px;">
        <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e8e0d8;">
          <div style="background: #16130f; padding: 24px 32px; text-align: center;">
            <h1 style="color: #e5a93c; font-family: Georgia, serif; font-size: 28px; margin: 0;">${SITE_NAME}</h1>
            <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 6px 0 0;">A luxury gifting atelier</p>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #16130f; font-family: Georgia, serif; font-size: 22px; margin: 0 0 8px;">Order Confirmed! 🎁</h2>
            <p style="color: #8b7d6b; font-size: 15px; line-height: 1.6;">Dear ${name},</p>
            <p style="color: #8b7d6b; font-size: 15px; line-height: 1.6;">
              Thank you for your order. We've received it and our artisans are already crafting your gifts with care.
            </p>
            <div style="background: #faf7f2; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #e8e0d8;">
              <p style="margin: 0 0 8px; color: #16130f; font-weight: bold; font-size: 14px;">Order Details</p>
              <p style="margin: 4px 0; color: #8b7d6b; font-size: 14px;">Order ID: <strong style="color: #16130f;">${shortId}</strong></p>
              <p style="margin: 4px 0; color: #8b7d6b; font-size: 14px;">Total: <strong style="color: #e5a93c;">₹${total.toLocaleString("en-IN")}</strong></p>
            </div>
            <p style="color: #8b7d6b; font-size: 14px; line-height: 1.6;">
              You'll receive another email when your order is shipped. If you have any questions, reply to this email.
            </p>
            <div style="text-align: center; margin-top: 28px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}" style="background: #e5a93c; color: #16130f; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                Track Your Order →
              </a>
            </div>
          </div>
          <div style="background: #faf7f2; border-top: 1px solid #e8e0d8; padding: 20px 32px; text-align: center;">
            <p style="color: #8b7d6b; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${SITE_NAME}. Crafted with care in India.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

interface OrderStatusProps {
  to: string;
  userName: string | null;
  orderId: string;
  status: string;
}

export async function sendOrderStatusEmail({
  to,
  userName,
  orderId,
  status,
}: OrderStatusProps) {
  const transporter = createTransporter();
  const name = userName ?? "Valued Customer";
  const shortId = `#${orderId.slice(0, 8).toUpperCase()}`;

  const STATUS_MESSAGES: Record<string, string> = {
    processing: "Your order is being crafted by our artisans.",
    shipped: "Your gift is on its way to you!",
    delivered: "Your gift has been delivered. We hope it brings joy!",
    cancelled: "Your order has been cancelled. If you have questions, please contact us.",
  };

  const message = STATUS_MESSAGES[status] ?? `Your order status has been updated to: ${status}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? `${SITE_NAME} <${process.env.SMTP_USER}>`,
    to,
    subject: `Order Update ${shortId} — ${status.charAt(0).toUpperCase() + status.slice(1)} | ${SITE_NAME}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Georgia, serif; background: #faf7f2; margin: 0; padding: 40px 20px;">
        <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; border: 1px solid #e8e0d8;">
          <div style="background: #16130f; padding: 24px 32px; text-align: center;">
            <h1 style="color: #e5a93c; font-size: 28px; margin: 0; font-family: Georgia, serif;">${SITE_NAME}</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #16130f; font-family: Georgia, serif; font-size: 20px;">Order Update</h2>
            <p style="color: #8b7d6b; line-height: 1.6;">Dear ${name},</p>
            <p style="color: #8b7d6b; line-height: 1.6;">${message}</p>
            <div style="background: #faf7f2; border-radius: 12px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; color: #16130f; font-size: 14px;">Order ${shortId} · Status: <strong style="text-transform: capitalize;">${status}</strong></p>
            </div>
            <div style="text-align: center; margin-top: 24px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}" style="background: #e5a93c; color: #16130f; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">View Order</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

interface WelcomeEmailProps {
  to: string;
  userName: string | null;
}

export async function sendWelcomeEmail({ to, userName }: WelcomeEmailProps) {
  const transporter = createTransporter();
  const name = userName ?? "Gifter";

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? `${SITE_NAME} <${process.env.SMTP_USER}>`,
    to,
    subject: `Welcome to ${SITE_NAME} — Your first gift awaits`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Georgia, serif; background: #faf7f2; margin: 0; padding: 40px 20px;">
        <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; border: 1px solid #e8e0d8;">
          <div style="background: #16130f; padding: 24px 32px; text-align: center;">
            <h1 style="color: #e5a93c; font-size: 28px; margin: 0; font-family: Georgia, serif;">${SITE_NAME}</h1>
          </div>
          <div style="padding: 32px; text-align: center;">
            <h2 style="color: #16130f; font-family: Georgia, serif; font-size: 24px;">Welcome, ${name}! 🎁</h2>
            <p style="color: #8b7d6b; line-height: 1.6; font-size: 15px;">You've joined a community of 25,000+ gifters who know that the right gift changes everything.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/shop" style="background: #e5a93c; color: #16130f; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 16px;">Explore Collections →</a>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

interface ContactEmailProps {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export async function sendContactEmail({ name, email, phone, message }: ContactEmailProps) {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? `${SITE_NAME} <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER,
    replyTo: email,
    subject: `Contact Form: Message from ${name}`,
    html: `
      <div style="font-family: sans-serif; padding: 24px;">
        <h2 style="color: #16130f;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p style="background: #faf7f2; padding: 16px; border-radius: 8px;">${message}</p>
      </div>
    `,
  });
}
