"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Minus, Plus, Trash2, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/useCartStore";
import { formatPrice } from "@/lib/utils/formatters";
import { ROUTES } from "@/constants/routes";
import { MIN_ORDER_FOR_FREE_WRAP } from "@/constants/ui";
import { CONFIRMATIONS } from "@/constants/confirmations";
import { useConfirm } from "@/hooks/useConfirm";
import { cn } from "@/lib/utils/cn";

export function CartDrawer() {
  const confirm = useConfirm();
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal, getItemCount, clearCart } =
    useCartStore();

  const handleClearCart = async () => {
    if (await confirm(CONFIRMATIONS.CART_CLEAR)) clearCart();
  };
  const subtotal = getSubtotal();
  const itemCount = getItemCount();
  const wrapRemaining = Math.max(0, MIN_ORDER_FOR_FREE_WRAP - subtotal);
  const wrapProgress = Math.min(100, (subtotal / MIN_ORDER_FOR_FREE_WRAP) * 100);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 gap-0 bg-white flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="bg-cream border-b border-border px-5 py-4 pr-14">
          <SheetTitle className="font-display text-lg text-dark flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-gold" />
            </span>
            Your Cart
            {itemCount > 0 && (
              <span className="text-xs font-sans font-semibold text-dark bg-gold rounded-full px-2 py-0.5">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
            <span className="w-20 h-20 rounded-full bg-cream flex items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-gold/50" />
            </span>
            <div>
              <p className="font-display font-semibold text-dark">Your cart is empty</p>
              <p className="text-sm text-warm-gray mt-1">
                Find something special for someone special.
              </p>
            </div>
            <Button
              className="bg-gold text-dark hover:bg-gold-dark font-semibold rounded-full px-8"
              onClick={closeCart}
              asChild
            >
              <Link href={ROUTES.SHOP}>Browse Gifts</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Free gift wrap progress */}
            <div className="px-5 pt-4">
              <div className="rounded-xl bg-gold/10 border border-gold/20 px-4 py-3">
                <p className="text-xs font-medium text-dark flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-gold flex-shrink-0" />
                  {wrapRemaining > 0 ? (
                    <>Add {formatPrice(wrapRemaining)} more to unlock free gift wrap</>
                  ) : (
                    <>You&apos;ve unlocked free gift wrap!</>
                  )}
                </p>
                <div className="h-1.5 rounded-full bg-gold/20 mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gold transition-all duration-500"
                    style={{ width: `${wrapProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-2xl border border-border bg-cream/40 p-3"
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
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={ROUTES.PRODUCT(item.product.slug)}
                        onClick={closeCart}
                        className="text-sm font-medium text-dark leading-snug line-clamp-2 hover:text-gold transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 p-0.5"
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {item.customization?.name && (
                      <p className="text-xs text-warm-gray truncate mt-0.5">
                        For: {item.customization.name}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="flex items-center rounded-full border border-border bg-white overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gold/10 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-semibold w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className={cn(
                            "w-7 h-7 flex items-center justify-center hover:bg-gold/10 transition-colors",
                            item.quantity >= item.product.stock && "opacity-40 pointer-events-none"
                          )}
                          aria-label="Increase quantity"
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

            {/* Footer */}
            <div className="border-t border-border bg-cream/50 px-5 py-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-warm-gray">Subtotal</span>
                <span className="font-display font-bold text-lg text-dark">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-xs text-warm-gray">
                Shipping and taxes calculated at checkout
              </p>
              <Button
                className="w-full h-11 bg-gold text-dark hover:bg-gold-dark font-semibold rounded-full"
                asChild
                onClick={closeCart}
              >
                <Link href={ROUTES.CHECKOUT}>Proceed to Checkout</Link>
              </Button>
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full border-gold/40 text-dark hover:border-gold hover:bg-gold/5"
                  asChild
                  onClick={closeCart}
                >
                  <Link href={ROUTES.CART}>View Full Cart</Link>
                </Button>
                <button
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 flex-shrink-0"
                  onClick={handleClearCart}
                >
                  <Trash2 className="h-3 w-3" /> Clear
                </button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
