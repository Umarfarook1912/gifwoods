import Image from "next/image";
import { MapPin, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/formatters";
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
            className="flex items-center gap-3 rounded-2xl border border-border p-3"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream">
              {item.product.images[0] && (
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium text-dark">
                {item.product.name}
              </p>
              <p className="mt-1 text-xs text-warm-gray">Quantity: {item.quantity}</p>
            </div>
            <span className="text-sm font-semibold text-dark">
              {formatPrice(item.product.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <Button
        className="h-12 w-full rounded-full bg-gold font-semibold text-dark hover:bg-gold-dark"
        onClick={onContinue}
      >
        Continue to payment
      </Button>
    </div>
  );
}
