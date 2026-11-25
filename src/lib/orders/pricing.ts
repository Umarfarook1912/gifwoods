import { GST_RATE } from "@/constants/ui";
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

/** One cart/checkout line used to compute per-product shipping. */
export interface ShippingLineInput {
  shipping_charge?: number | null;
  fast_shipping_charge?: number | null;
  quantity: number;
}

function unitShipping(
  line: ShippingLineInput,
  method: DeliveryMethod
): number {
  const base = Number(line.shipping_charge ?? 0);
  const fast =
    method === "fast" ? Number(line.fast_shipping_charge ?? 0) : 0;
  return base + fast;
}

/**
 * Sum of per-product shipping × qty.
 * Normal = shipping_charge; Fast = shipping_charge + fast_shipping_charge.
 * Test-product orders skip shipping entirely.
 */
export function calculateShipping(
  lines: ShippingLineInput[],
  method: DeliveryMethod = "normal",
  options?: { isTestOrder?: boolean }
): number {
  if (options?.isTestOrder) return 0;
  return roundMoney(
    lines.reduce(
      (sum, line) => sum + unitShipping(line, method) * line.quantity,
      0
    )
  );
}

/** Fast surcharge portion only (sum of fast_shipping_charge × qty). */
export function getFastDeliverySurcharge(
  lines: ShippingLineInput[],
  method: DeliveryMethod
): number {
  if (method !== "fast") return 0;
  return roundMoney(
    lines.reduce(
      (sum, line) =>
        sum + Number(line.fast_shipping_charge ?? 0) * line.quantity,
      0
    )
  );
}

/** Order total = products + GST (on products) + shipping (untaxed). */
export function calculateOrderTotal(
  subtotal: number,
  shippingCost: number,
  gstAmount = calculateGst(subtotal)
): number {
  return roundMoney(subtotal + gstAmount + shippingCost);
}
