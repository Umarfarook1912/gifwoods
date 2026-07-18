"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, X, Minus, Plus, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/hooks/useCartStore";
import { formatPrice } from "@/lib/utils/formatters";
import { ROUTES } from "@/constants/routes";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } =
    useCartStore();
  const subtotal = getSubtotal();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="w-full sm:w-96 flex flex-col bg-cream">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-display text-xl text-dark flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-gold" />
            Your Cart
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button
              className="bg-gold text-dark hover:bg-gold-dark"
              onClick={closeCart}
              asChild
            >
              <Link href={ROUTES.SHOP}>Browse Gifts</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
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
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark leading-tight truncate">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gold font-semibold mt-0.5">
                      {formatPrice(item.product.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded border border-border flex items-center justify-center hover:border-gold transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded border border-border flex items-center justify-center hover:border-gold transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    aria-label="Remove item"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-warm-gray">Subtotal</span>
                <span className="font-semibold text-dark">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-warm-gray">Shipping calculated at checkout</p>
              <Button
                className="w-full bg-gold text-dark hover:bg-gold-dark font-semibold"
                asChild
                onClick={closeCart}
              >
                <Link href={ROUTES.CHECKOUT}>Proceed to Checkout</Link>
              </Button>
              <Button
                variant="outline"
                className="w-full border-gold/30 text-dark hover:border-gold"
                asChild
                onClick={closeCart}
              >
                <Link href={ROUTES.CART}>View Full Cart</Link>
              </Button>
              <button
                className="w-full text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center gap-1"
                onClick={() => useCartStore.getState().clearCart()}
              >
                <Trash2 className="h-3 w-3" /> Clear cart
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
