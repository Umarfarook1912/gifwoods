import type {
  ShiprocketTokenResponse,
  ShiprocketOrderPayload,
  ShiprocketOrderResponse,
  ShiprocketAWBResponse,
  ShiprocketPickupResponse,
  ShiprocketTrackingResponse,
  ShiprocketServiceabilityResponse,
} from "@/types/shiprocket";

// In-memory token cache (valid for 24 h)
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

function getBaseUrl(): string {
  return process.env.SHIPROCKET_BASE_URL ?? "https://apiv2.shiprocket.in/v1/external";
}

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await fetch(`${getBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shiprocket auth failed: ${text}`);
  }

  const data = (await res.json()) as ShiprocketTokenResponse;
  cachedToken = data.token;
  // Cache for 23 hours (token valid 24 h)
  tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
  return cachedToken;
}

async function shiprocketFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shiprocket API error [${res.status}] ${path}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function createShiprocketOrder(
  payload: ShiprocketOrderPayload
): Promise<ShiprocketOrderResponse> {
  return shiprocketFetch<ShiprocketOrderResponse>("/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function assignAWB(
  shipmentId: number | string
): Promise<ShiprocketAWBResponse> {
  return shiprocketFetch<ShiprocketAWBResponse>("/courier/assign/awb", {
    method: "POST",
    body: JSON.stringify({ shipment_id: String(shipmentId) }),
  });
}

export async function schedulePickup(
  shipmentId: number | string
): Promise<ShiprocketPickupResponse> {
  return shiprocketFetch<ShiprocketPickupResponse>(
    "/courier/generate/pickup",
    {
      method: "POST",
      body: JSON.stringify({ shipment_id: [String(shipmentId)] }),
    }
  );
}

export async function getTracking(
  awb: string
): Promise<ShiprocketTrackingResponse> {
  return shiprocketFetch<ShiprocketTrackingResponse>(
    `/courier/track/awb/${encodeURIComponent(awb)}`
  );
}

export async function cancelShiprocketOrder(
  shiprocketOrderId: string | number
): Promise<{ message: string }> {
  return shiprocketFetch<{ message: string }>("/orders/cancel", {
    method: "POST",
    body: JSON.stringify({ ids: [Number(shiprocketOrderId)] }),
  });
}

interface ServiceabilityParams {
  pickupPostcode: string;
  deliveryPostcode: string;
  weightKg?: number;
  cod?: 0 | 1;
  declaredValue: number;
}

export async function checkCourierServiceability({
  pickupPostcode,
  deliveryPostcode,
  weightKg = 1,
  cod = 0,
  declaredValue,
}: ServiceabilityParams): Promise<ShiprocketServiceabilityResponse> {
  const query = new URLSearchParams({
    pickup_postcode: pickupPostcode,
    delivery_postcode: deliveryPostcode,
    cod: String(cod),
    weight: String(weightKg),
    declared_value: String(Math.max(1, Math.round(declaredValue))),
    is_return: "0",
  });

  return shiprocketFetch<ShiprocketServiceabilityResponse>(
    `/courier/serviceability/?${query.toString()}`
  );
}
