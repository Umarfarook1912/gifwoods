"use client";

import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils/formatters";
import { getProductOfferPricing } from "@/lib/products/offer-price";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/types/product";

interface Props {
  product: Pick<
    Product,
    "price" | "original_price" | "offer_type" | "offer_value" | "offer_starts_at" | "offer_ends_at"
  >;
  priceClassName?: string;
  compareClassName?: string;
  showBadge?: boolean;
}

/** Unit price with optional strike-through compare-at and offer badge. */
export function ProductOfferPrice({
  product,
  priceClassName,
  compareClassName,
  showBadge = true,
}: Props) {
  const pricing = getProductOfferPricing(product);

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className={cn("font-bold text-dark", priceClassName)}>
        {formatPrice(pricing.unitPrice)}
      </span>
      {pricing.compareAtPrice != null && (
        <span className={cn("text-warm-gray line-through", compareClassName)}>
          {formatPrice(pricing.compareAtPrice)}
        </span>
      )}
      {showBadge && pricing.offerBadge && (
        <Badge className="border-0 bg-gold/20 text-dark text-xs font-semibold">
          {pricing.offerBadge}
        </Badge>
      )}
    </div>
  );
}
