import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
} from "@/constants/ui";
import { FAST_DELIVERY_FEE } from "@/constants/shipping";
import type { DeliveryMethod } from "@/types/shipping";

/** Base shipping (free above threshold) + optional Fast delivery surcharge. */
export function calculateShipping(
  subtotal: number,
  method: DeliveryMethod = "normal"
): number {
  const base = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const express = method === "fast" ? FAST_DELIVERY_FEE : 0;
  return base + express;
}

export function getFastDeliverySurcharge(method: DeliveryMethod): number {
  return method === "fast" ? FAST_DELIVERY_FEE : 0;
}
