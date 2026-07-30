import Image from "next/image";
import { PackageCheck, Truck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils/formatters";
import { FREE_SHIPPING_THRESHOLD } from "@/constants/ui";
import type { CartItem } from "@/types/cart";

interface Props {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

export function CheckoutSummary({ items, subtotal, shipping, total }: Props) {
  return (
    <aside className="h-fit rounded-3xl border border-border bg-white p-5 shadow-sm lg:sticky lg:top-24">
      <div className="flex items-center gap-2">
        <PackageCheck className="h-5 w-5 text-gold" />
        <h2 className="font-display text-lg font-bold text-dark">Order summary</h2>
      </div>

      <div className="my-5 max-h-64 space-y-4 overflow-y-auto pr-1">
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
              <span className="absolute right-1 top-1 rounded-full bg-dark px-1.5 py-0.5 text-[10px] text-white">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium text-dark">
                {item.product.name}
              </p>
              <p className="mt-1 text-xs text-warm-gray">
                {formatPrice(item.product.price)} each
              </p>
            </div>
            <span className="text-sm font-semibold text-dark">
              {formatPrice(item.product.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <Separator />
      <div className="space-y-3 py-4 text-sm">
        <div className="flex justify-between">
          <span className="text-warm-gray">Subtotal</span>
          <span className="font-medium text-dark">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-warm-gray">Shipping</span>
          <span className={shipping === 0 ? "font-semibold text-emerald-600" : "font-medium text-dark"}>
            {shipping === 0 ? "Free" : formatPrice(shipping)}
          </span>
        </div>
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
          Free shipping on orders above {formatPrice(FREE_SHIPPING_THRESHOLD)}. Otherwise ₹75 shipping applies.
        </span>
      </div>
    </aside>
  );
}
