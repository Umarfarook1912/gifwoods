"use client";

import { Calendar, Loader2 } from "lucide-react";
import { DELIVERY_COPY, DELIVERY_METHODS } from "@/constants/shipping";
import { useDeliveryEstimate } from "@/hooks/useDeliveryEstimate";
import type { CartItem } from "@/types/cart";
import type { DeliveryMethod } from "@/types/shipping";

interface Props {
  pincode: string;
  items: CartItem[];
  subtotal: number;
  shippingMethod: DeliveryMethod;
}

function toEstimateProduct(items: CartItem[], subtotal: number) {
  return {
    customization_text: items.some((item) => item.product.customization_text),
    customization_image: items.some((item) => item.product.customization_image),
    price: Math.max(1, Math.round(subtotal)),
  };
}

export function CheckoutDeliveryDate({
  pincode,
  items,
  subtotal,
  shippingMethod,
}: Props) {
  const digits = pincode.replace(/\D/g, "").slice(0, 6);
  const product = toEstimateProduct(items, subtotal);
  const { data, isFetching, error } = useDeliveryEstimate(digits, product);

  if (digits.length !== 6) return null;

  if (isFetching) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-warm-gray">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
        {DELIVERY_COPY.CHECKING}
      </p>
    );
  }

  if (error || (data && !data.serviceable)) {
    return (
      <p className="text-xs text-destructive">
        {error instanceof Error ? error.message : DELIVERY_COPY.NOT_SERVICEABLE}
      </p>
    );
  }

  if (!data?.serviceable) return null;

  const formattedDate =
    shippingMethod === DELIVERY_METHODS.FAST
      ? data.options.fast.formattedDate
      : data.options.normal.formattedDate;

  if (!formattedDate) return null;

  return (
    <p className="flex items-start gap-1.5 text-xs text-dark">
      <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
      <span>
        {DELIVERY_COPY.ESTIMATED_ON_OR_BEFORE}{" "}
        <span className="font-semibold">{formattedDate}</span>
      </span>
    </p>
  );
}
