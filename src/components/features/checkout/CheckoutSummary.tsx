"use client";

import Image from "next/image";
import { Minus, PackageCheck, Plus, Trash2, Truck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { useCartStore } from "@/hooks/useCartStore";
import { FREE_SHIPPING_THRESHOLD } from "@/constants/ui";
import { CHECKOUT_COPY } from "@/constants/checkout";
import { DELIVERY_METHODS, FAST_DELIVERY_FEE } from "@/constants/shipping";
import { ShippingMethodToggle } from "@/components/features/cart/ShippingMethodToggle";
import { CheckoutDeliveryDate } from "@/components/features/checkout/CheckoutDeliveryDate";
import { getFastDeliverySurcharge } from "@/lib/orders/pricing";
import type { CartItem } from "@/types/cart";
import type { DeliveryMethod } from "@/types/shipping";

interface Props {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingMethod: DeliveryMethod;
  onShippingMethodChange: (method: DeliveryMethod) => void;
  pincode?: string;
}

export function CheckoutSummary({
  items,
  subtotal,
  shipping,
  total,
  shippingMethod,
  onShippingMethodChange,
  pincode = "",
}: Props) {
  const { removeItem, updateQuantity } = useCartStore();
  const fastFee = getFastDeliverySurcharge(shippingMethod);

  return (
    <aside className="h-fit rounded-3xl border border-border bg-white p-5 shadow-sm lg:sticky lg:top-24">
      <div className="flex items-center gap-2">
        <PackageCheck className="h-5 w-5 text-gold" />
        <h2 className="font-display text-lg font-bold text-dark">Order summary</h2>
      </div>

      <div className="my-5 max-h-72 space-y-4 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream">
              {item.product.images[0] && (
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="line-clamp-2 text-sm font-medium text-dark">
                  {item.product.name}
                </p>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="shrink-0 p-0.5 text-warm-gray transition-colors hover:text-destructive"
                  aria-label={`${CHECKOUT_COPY.REMOVE_ITEM}: ${item.product.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-0.5 text-xs text-warm-gray">
                {formatPrice(item.product.price)} each
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center overflow-hidden rounded-full border border-border bg-white">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="flex h-7 w-7 items-center justify-center transition-colors hover:bg-gold/10"
                    aria-label={CHECKOUT_COPY.DECREASE_QTY}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="min-w-6 px-1.5 text-center text-xs font-semibold text-dark">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center transition-colors hover:bg-gold/10",
                      item.quantity >= item.product.stock && "pointer-events-none opacity-40"
                    )}
                    aria-label={CHECKOUT_COPY.INCREASE_QTY}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <span className="text-sm font-semibold text-dark">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Separator />
      <div className="space-y-3 py-4 text-sm">
        <ShippingMethodToggle
          selected={shippingMethod}
          onSelect={onShippingMethodChange}
        />
        <CheckoutDeliveryDate
          pincode={pincode}
          items={items}
          subtotal={subtotal}
          shippingMethod={shippingMethod}
        />
        <div className="flex justify-between">
          <span className="text-warm-gray">Subtotal</span>
          <span className="font-medium text-dark">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-warm-gray">
            Shipping
            {shippingMethod === DELIVERY_METHODS.FAST ? " (incl. Fast)" : ""}
          </span>
          <span className={shipping === 0 ? "font-semibold text-emerald-600" : "font-medium text-dark"}>
            {shipping === 0 ? "Free" : formatPrice(shipping)}
          </span>
        </div>
        {fastFee > 0 && (
          <p className="text-xs text-warm-gray">
            Includes Fast surcharge of {formatPrice(FAST_DELIVERY_FEE)}
          </p>
        )}
      </div>
      <Separator />
      <div className="flex items-end justify-between py-4">
        <span className="font-semibold text-dark">Total</span>
        <span className="font-display text-2xl font-bold text-dark">
          {formatPrice(total)}
        </span>
      </div>

      <div className="flex gap-2 rounded-xl bg-cream p-3 text-xs text-warm-gray">
        <Truck className="h-4 w-4 shrink-0 text-gold" />
        <span>
          Free base shipping above {formatPrice(FREE_SHIPPING_THRESHOLD)}. Fast adds{" "}
          {formatPrice(FAST_DELIVERY_FEE)}.
        </span>
      </div>
    </aside>
  );
}
