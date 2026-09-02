import { createHmac, timingSafeEqual } from "crypto";
import type {
  CashfreeOrderRequest,
  CashfreeOrderResponse,
  CashfreeOrderStatusResponse,
  CashfreePaymentResponse,
} from "@/types/payment";
import { APP_ERRORS } from "@/constants/errors";

const CASHFREE_BASE_URL =
  process.env.CASHFREE_ENV === "PROD"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

const CASHFREE_HEADERS = {
  "Content-Type": "application/json",
  "x-client-id": process.env.CASHFREE_APP_ID!,
  "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
  "x-api-version": "2023-08-01",
};

export function createCashfreeOrderId(databaseOrderId: string): string {
  return `GW_${databaseOrderId}`;
}

export function getDatabaseOrderId(cashfreeOrderId: string): string {
  return cashfreeOrderId.replace(/^GW_/, "");
}

export async function createCashfreeOrder(
  payload: CashfreeOrderRequest
): Promise<CashfreeOrderResponse> {
  const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
    method: "POST",
    headers: CASHFREE_HEADERS,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    console.error("Cashfree order creation failed:", error);
    throw new Error(APP_ERRORS.PAYMENT_INIT_FAILED);
  }

  return response.json() as Promise<CashfreeOrderResponse>;
}

export async function getCashfreeOrder(
  orderId: string
): Promise<CashfreeOrderStatusResponse> {
  const response = await fetch(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
    headers: CASHFREE_HEADERS,
    cache: "no-store",
  });
  if (!response.ok) throw new Error(APP_ERRORS.PAYMENT_FAILED);
  return response.json() as Promise<CashfreeOrderStatusResponse>;
}

export async function getCashfreeOrderPayments(
  orderId: string
): Promise<CashfreePaymentResponse[]> {
  const response = await fetch(`${CASHFREE_BASE_URL}/orders/${orderId}/payments`, {
    headers: CASHFREE_HEADERS,
    cache: "no-store",
  });
  if (!response.ok) return [];
  return response.json() as Promise<CashfreePaymentResponse[]>;
}

export function verifyCashfreeWebhook(
  rawBody: string,
  timestamp: string,
  signature: string
): boolean {
  const expected = createHmac("sha256", process.env.CASHFREE_SECRET_KEY!)
    .update(`${timestamp}${rawBody}`)
    .digest();
  const received = Buffer.from(signature, "base64");
  return expected.length === received.length && timingSafeEqual(expected, received);
}
