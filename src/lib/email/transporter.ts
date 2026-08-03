import { BREVO_API, EMAIL_DEFAULTS } from "@/constants/email";

export interface SendEmailParams {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  toName?: string;
}

function parseFromAddress(from: string): { name: string; email: string } {
  const match = from.match(/^(.*?)\s*<([^>]+)>$/);
  if (match) {
    return {
      name: match[1].trim() || EMAIL_DEFAULTS.FROM_NAME,
      email: match[2].trim(),
    };
  }
  return {
    name: EMAIL_DEFAULTS.FROM_NAME,
    email: from.trim() || EMAIL_DEFAULTS.FROM_EMAIL,
  };
}

export function getEmailFrom(): string {
  return (
    process.env.EMAIL_FROM ??
    `${EMAIL_DEFAULTS.FROM_NAME} <${EMAIL_DEFAULTS.FROM_EMAIL}>`
  );
}

export function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL ?? EMAIL_DEFAULTS.FROM_EMAIL;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
  toName,
}: SendEmailParams): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  const sender = parseFromAddress(getEmailFrom());

  const response = await fetch(`${BREVO_API.BASE_URL}${BREVO_API.SEND_EMAIL_PATH}`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to, ...(toName ? { name: toName } : {}) }],
      subject,
      ...(html ? { htmlContent: html } : {}),
      ...(text ? { textContent: text } : {}),
      ...(replyTo ? { replyTo: { email: replyTo } } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Brevo API error ${response.status}: ${body}`);
  }
}
