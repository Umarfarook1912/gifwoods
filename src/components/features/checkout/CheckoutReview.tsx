"use client";

import Image from "next/image";
import { MapPin, Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { useCartStore } from "@/hooks/useCartStore";
import { CHECKOUT_COPY } from "@/constants/checkout";
import type { CartItem } from "@/types/cart";
import type { ShippingAddress } from "@/types/order";

interface Props {
  address: ShippingAddress;
  items: CartItem[];
  onEditAddress: () => void;
  onContinue: () => void;
}

export function CheckoutReview({
  address,
  items,
  onEditAddress,
  onContinue,
}: Props) {
  const { removeItem, updateQuantity } = useCartStore();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-cream/60 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15">
              <MapPin className="h-4 w-4 text-gold" />
            </span>
            <div>
              <p className="font-semibold text-dark">{address.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-warm-gray">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}, {address.city},{" "}
                {address.state} — {address.pincode}
              </p>
              <p className="mt-1 text-sm text-warm-gray">{address.phone}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditAddress}
            className="shrink-0 text-dark hover:bg-gold/10"
          >
            <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-border p-3 sm:p-4"
          >
            <div className="flex gap-3 sm:gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream sm:h-20 sm:w-20">
                {item.product.images[0] && (
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-2 text-sm font-medium text-dark sm:text-base">
                    {item.product.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="shrink-0 p-1 text-warm-gray transition-colors hover:text-destructive"
                    aria-label={`${CHECKOUT_COPY.REMOVE_ITEM}: ${item.product.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {item.customization?.name && (
                  <p className="mt-1 text-xs text-warm-gray">
                    For: {item.customization.name}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center overflow-hidden rounded-full border border-border bg-white">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-gold/10"
                      aria-label={CHECKOUT_COPY.DECREASE_QTY}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-8 px-2 text-center text-sm font-semibold text-dark">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center transition-colors hover:bg-gold/10",
                        item.quantity >= item.product.stock && "pointer-events-none opacity-40"
                      )}
                      aria-label={CHECKOUT_COPY.INCREASE_QTY}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-dark">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                    <p className="text-xs text-warm-gray">
                      {formatPrice(item.product.price)} each
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        className="h-12 w-full rounded-full bg-gold font-semibold text-dark hover:bg-gold-dark"
        onClick={onContinue}
        disabled={items.length === 0}
      >
        Continue to payment
      </Button>
    </div>
  );
}
