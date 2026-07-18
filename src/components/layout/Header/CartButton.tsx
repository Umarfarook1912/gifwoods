"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/useCartStore";

export function CartButton() {
  const { openCart, getItemCount } = useCartStore();
  const count = getItemCount();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative text-secondary-dark hover:text-gold"
      onClick={openCart}
      aria-label={`Open cart with ${count} items`}
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-gold text-dark text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Button>
  );
}
