import { createHmac, timingSafeEqual } from "crypto";
import type {
  CashfreeOrderRequest,
  CashfreeOrderResponse,
  CashfreeOrderStatusResponse,
  CashfreePaymentResponse,
} from "@/types/payment";
import { APP_ERRORS } from "@/constants/errors";

/**
 * - prod: live API + CASHFREE_*
 * - sandbox: sandbox API + CASHFREE_* (whole app in TEST env)
 * - test: sandbox API + CASHFREE_TEST_* (test-product order on a PROD site)
 */
export type CashfreeMode = "prod" | "sandbox" | "test";

const CASHFREE_API_VERSION = "2026-01-01";

function getCashfreeConfig(mode: CashfreeMode) {
  if (mode === "test") {
    const appId = process.env.CASHFREE_TEST_APP_ID;
    const secret = process.env.CASHFREE_TEST_SECRET_KEY;
    if (!appId || !secret) {
      throw new Error(APP_ERRORS.PAYMENT_INIT_FAILED);
    }
    return {
      baseUrl: "https://sandbox.cashfree.com/pg",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": appId,
        "x-client-secret": secret,
        "x-api-version": CASHFREE_API_VERSION,
      },
    };
  }

  if (mode === "prod") {
    return {
      baseUrl: "https://api.cashfree.com/pg",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_APP_ID!,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
        "x-api-version": CASHFREE_API_VERSION,
      },
    };
  }

  // Whole-app sandbox (CASHFREE_ENV !== PROD)
  return {
    baseUrl: "https://sandbox.cashfree.com/pg",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": process.env.CASHFREE_APP_ID!,
      "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
      "x-api-version": CASHFREE_API_VERSION,
    },
  };
}

/** Resolve mode from order flag or global env. */
export function resolveCashfreeMode(isTestOrder?: boolean): CashfreeMode {
  if (isTestOrder) return "test";
  return process.env.CASHFREE_ENV === "PROD" ? "prod" : "sandbox";
}

export function toCashfreeJsMode(mode: CashfreeMode): "production" | "sandbox" {
  return mode === "prod" ? "production" : "sandbox";
}

export function createCashfreeOrderId(databaseOrderId: string): string {
  return `GW_${databaseOrderId}`;
}

export function getDatabaseOrderId(cashfreeOrderId: string): string {
  return cashfreeOrderId.replace(/^GW_/, "");
}

export async function createCashfreeOrder(
  payload: CashfreeOrderRequest,
  mode: CashfreeMode = resolveCashfreeMode()
): Promise<CashfreeOrderResponse> {
  const { baseUrl, headers } = getCashfreeConfig(mode);
  const response = await fetch(`${baseUrl}/orders`, {
    method: "POST",
    headers,
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
  orderId: string,
  mode: CashfreeMode = resolveCashfreeMode()
): Promise<CashfreeOrderStatusResponse> {
  const { baseUrl, headers } = getCashfreeConfig(mode);
  const response = await fetch(`${baseUrl}/orders/${orderId}`, {
    headers,
    cache: "no-store",
  });
  if (!response.ok) throw new Error(APP_ERRORS.PAYMENT_FAILED);
  return response.json() as Promise<CashfreeOrderStatusResponse>;
}

export async function getCashfreeOrderPayments(
  orderId: string,
  mode: CashfreeMode = resolveCashfreeMode()
): Promise<CashfreePaymentResponse[]> {
  const { baseUrl, headers } = getCashfreeConfig(mode);
  const response = await fetch(`${baseUrl}/orders/${orderId}/payments`, {
    headers,
    cache: "no-store",
  });
  if (!response.ok) return [];
  return response.json() as Promise<CashfreePaymentResponse[]>;
}

function verifyWithSecret(
  rawBody: string,
  timestamp: string,
  signature: string,
  secret: string
): boolean {
  if (!secret) return false;
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}${rawBody}`)
    .digest();
  const received = Buffer.from(signature, "base64");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

/** Accept webhooks signed with either PROD or TEST Cashfree secrets. */
export function verifyCashfreeWebhook(
  rawBody: string,
  timestamp: string,
  signature: string
): boolean {
  const prodSecret = process.env.CASHFREE_SECRET_KEY ?? "";
  const testSecret = process.env.CASHFREE_TEST_SECRET_KEY ?? "";
  return (
    verifyWithSecret(rawBody, timestamp, signature, prodSecret) ||
    verifyWithSecret(rawBody, timestamp, signature, testSecret)
  );
}
