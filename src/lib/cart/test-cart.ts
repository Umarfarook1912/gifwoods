import type { CartItem } from "@/types/cart";

/** Cart is a test checkout when every line item is a test product. */
export function isTestCart(items: CartItem[]): boolean {
  return items.length > 0 && items.every((item) => Boolean(item.product.is_test));
}

/** True when the cart mixes test and normal products (not allowed at checkout). */
export function isMixedTestCart(items: CartItem[]): boolean {
  if (items.length === 0) return false;
  const hasTest = items.some((item) => Boolean(item.product.is_test));
  const hasNormal = items.some((item) => !item.product.is_test);
  return hasTest && hasNormal;
}
