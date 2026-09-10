import { PRODUCT_OFFER_COPY, PRODUCT_OFFER_TYPES } from "@/constants/offers";
import { roundMoney } from "@/lib/orders/pricing";
import type { Product, ProductOfferType } from "@/types/product";

export interface ProductOfferPricing {
  unitPrice: number;
  compareAtPrice: number | null;
  isOfferActive: boolean;
  offerBadge: string | null;
  offerType: ProductOfferType | null;
  offerValue: number | null;
}

type OfferableProduct = Pick<
  Product,
  "price" | "offer_type" | "offer_value" | "offer_starts_at" | "offer_ends_at"
> & {
  original_price?: number | null;
};

export function isProductOfferActive(
  product: OfferableProduct,
  now = new Date()
): boolean {
  if (!product.offer_type || product.offer_value == null || product.offer_value <= 0) {
    return false;
  }
  if (!product.offer_starts_at || !product.offer_ends_at) return false;
  const start = new Date(product.offer_starts_at).getTime();
  const end = new Date(product.offer_ends_at).getTime();
  const t = now.getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  return t >= start && t <= end;
}

function applyOffer(price: number, type: ProductOfferType, value: number): number {
  if (type === PRODUCT_OFFER_TYPES.PERCENT) {
    const capped = Math.min(value, 100);
    return roundMoney(price * (1 - capped / 100));
  }
  return roundMoney(Math.max(0, price - value));
}

/** Selling price for cart/checkout; compare-at for strike-through display. */
export function getProductOfferPricing(
  product: OfferableProduct,
  now = new Date()
): ProductOfferPricing {
  const regular = Number(product.price);
  const active = isProductOfferActive(product, now);

  if (!active || !product.offer_type || product.offer_value == null) {
    const mrp = product.original_price;
    return {
      unitPrice: regular,
      compareAtPrice: mrp && mrp > regular ? mrp : null,
      isOfferActive: false,
      offerBadge: null,
      offerType: null,
      offerValue: null,
    };
  }

  const unitPrice = applyOffer(regular, product.offer_type, Number(product.offer_value));
  const offerBadge =
    product.offer_type === PRODUCT_OFFER_TYPES.PERCENT
      ? PRODUCT_OFFER_COPY.BADGE_PERCENT(Number(product.offer_value))
      : PRODUCT_OFFER_COPY.BADGE_AMOUNT(Number(product.offer_value));

  return {
    unitPrice: unitPrice < regular ? unitPrice : regular,
    compareAtPrice: unitPrice < regular ? regular : null,
    isOfferActive: unitPrice < regular,
    offerBadge: unitPrice < regular ? offerBadge : null,
    offerType: product.offer_type,
    offerValue: Number(product.offer_value),
  };
}

export function getEffectiveProductPrice(product: OfferableProduct, now = new Date()): number {
  return getProductOfferPricing(product, now).unitPrice;
}
