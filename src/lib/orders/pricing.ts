import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
  GST_RATE,
} from "@/constants/ui";
import { FAST_DELIVERY_FEE } from "@/constants/shipping";
import type { DeliveryMethod } from "@/types/shipping";

/** Round money to 2 decimal places (INR paise). */
export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/** Exclusive GST on product subtotal only — shipping is not taxed. */
export function calculateGst(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return roundMoney(subtotal * GST_RATE);
}

/** Base shipping (free above threshold) + optional Fast delivery surcharge.
 *  Test-product orders skip shipping entirely (product price only). */
export function calculateShipping(
  subtotal: number,
  method: DeliveryMethod = "normal",
  options?: { isTestOrder?: boolean }
): number {
  if (options?.isTestOrder) return 0;
  const base = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const express = method === "fast" ? FAST_DELIVERY_FEE : 0;
  return base + express;
}

export function getFastDeliverySurcharge(method: DeliveryMethod): number {
  return method === "fast" ? FAST_DELIVERY_FEE : 0;
}

/** Order total = products + GST (on products) + shipping (untaxed). */
export function calculateOrderTotal(
  subtotal: number,
  shippingCost: number,
  gstAmount = calculateGst(subtotal)
): number {
  return roundMoney(subtotal + gstAmount + shippingCost);
}
