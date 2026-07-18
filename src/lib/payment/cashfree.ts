import type { CashfreeOrderRequest, CashfreeOrderResponse } from "@/types/payment";

const CASHFREE_BASE_URL =
  process.env.CASHFREE_ENV === "PROD"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

export async function createCashfreeOrder(
  payload: CashfreeOrderRequest
): Promise<CashfreeOrderResponse> {
  const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": process.env.CASHFREE_APP_ID!,
      "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
      "x-api-version": "2023-08-01",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Cashfree order creation failed");
  }

  return response.json() as Promise<CashfreeOrderResponse>;
}

export function verifyCashfreeSignature(
  orderId: string,
  orderAmount: string,
  referenceId: string,
  paymentStatus: string,
  paymentTime: string,
  signature: string
): boolean {
  // Node.js crypto (server-side only)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require("crypto") as typeof import("crypto");
  const data = `${orderId}${orderAmount}${referenceId}${paymentStatus}${paymentTime}`;
  const hmac = crypto
    .createHmac("sha256", process.env.CASHFREE_SECRET_KEY!)
    .update(data)
    .digest("base64");
  return hmac === signature;
}
