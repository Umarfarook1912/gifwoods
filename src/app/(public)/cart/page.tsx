"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/hooks/useCartStore";
import { formatPrice } from "@/lib/utils/formatters";
import { ROUTES } from "@/constants/routes";
import { MIN_ORDER_FOR_FREE_WRAP } from "@/constants/ui";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, clearCart } = useCartStore();
  const subtotal = getSubtotal();
  const shipping = subtotal >= MIN_ORDER_FOR_FREE_WRAP ? 0 : 99;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-6 px-4">
        <ShoppingBag className="h-20 w-20 text-muted-foreground/20" />
        <h1 className="font-display text-3xl font-bold text-dark">Your cart is empty</h1>
        <p className="text-warm-gray text-center max-w-sm">
          Looks like you haven&apos;t added anything yet. Explore our curated collections!
        </p>
        <Button className="bg-gold text-dark hover:bg-gold-dark font-semibold" asChild>
          <Link href={ROUTES.SHOP}>Browse Gifts</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.SHOP}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-display text-3xl font-bold text-dark">Your Cart</h1>
          <Badge className="bg-gold/10 text-gold border-gold/30">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-border flex gap-4"
              >
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
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
                <div className="flex-1 min-w-0">
                  <Link
                    href={ROUTES.PRODUCT(item.product.slug)}
                    className="font-semibold text-dark hover:text-gold transition-colors line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                  {item.customization && Object.keys(item.customization).length > 0 && (
                    <div className="text-xs text-warm-gray mt-1 space-y-0.5">
                      {Object.entries(item.customization).map(([k, v]) => (
                        <div key={k}>
                          <span className="font-medium capitalize">{k}:</span> {v}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1.5 hover:bg-muted transition-colors"
                        aria-label="Decrease"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-semibold border-x border-border">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1.5 hover:bg-muted transition-colors"
                        aria-label="Increase"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-dark">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 ml-1"
            >
              <Trash2 className="h-3 w-3" /> Clear entire cart
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-border sticky top-24">
              <h2 className="font-display font-bold text-xl text-dark mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-warm-gray">Subtotal</span>
                  <span className="font-medium text-dark">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-warm-gray">Shipping</span>
                  <span className="font-medium text-dark">
                    {shipping === 0 ? (
                      <span className="text-emerald-600">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-warm-gray">Gift wrap</span>
                  <span className="text-emerald-600 font-medium">Complimentary</span>
                </div>
              </div>
              <Separator className="mb-4" />
              <div className="flex justify-between font-bold text-dark mb-6">
                <span>Total</span>
                <span className="text-xl">{formatPrice(total)}</span>
              </div>
              {subtotal < MIN_ORDER_FOR_FREE_WRAP && (
                <p className="text-xs text-warm-gray mb-4 p-3 rounded-lg bg-cream border border-gold/20">
                  Add {formatPrice(MIN_ORDER_FOR_FREE_WRAP - subtotal)} more for free shipping!
                </p>
              )}
              <Button
                className="w-full bg-gold text-dark hover:bg-gold-dark font-semibold h-12"
                asChild
              >
                <Link href={ROUTES.CHECKOUT}>Proceed to Checkout</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
