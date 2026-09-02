"use client";

import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api";
import { QUERY_KEYS } from "@/constants/query-keys";
import { APP_ERRORS } from "@/constants/errors";
import { toUserErrorMessage } from "@/lib/errors/user-message";
import type { Product } from "@/types/product";
import type { DeliveryEstimateResult } from "@/types/shipping";

async function fetchDeliveryEstimate(
  pincode: string,
  product: Pick<Product, "customization_text" | "customization_image" | "price">
): Promise<DeliveryEstimateResult> {
  const params = new URLSearchParams({
    pincode,
    customization_text: String(Boolean(product.customization_text)),
    customization_image: String(Boolean(product.customization_image)),
    declared_value: String(Math.max(1, Math.round(product.price))),
  });
  const response = await fetch(
    `${API_ENDPOINTS.SHIPPING_DELIVERY_ESTIMATE}?${params.toString()}`
  );
  const json = (await response.json()) as {
    data: DeliveryEstimateResult | null;
    error: string | null;
  };

  if (!response.ok || !json.data) {
    throw new Error(toUserErrorMessage(json.error, APP_ERRORS.DELIVERY_ESTIMATE_FAILED));
  }

  return json.data;
}

export function useDeliveryEstimate(
  pincode: string,
  product: Pick<Product, "customization_text" | "customization_image" | "price">
) {
  return useQuery({
    queryKey: QUERY_KEYS.DELIVERY_ESTIMATE(
      pincode,
      product.price,
      Boolean(product.customization_text || product.customization_image)
    ),
    queryFn: () => fetchDeliveryEstimate(pincode, product),
    enabled: pincode.length === 6,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
