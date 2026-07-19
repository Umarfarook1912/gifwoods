"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/hooks/useCartStore";

export function CartButton() {
  const { openCart, getItemCount } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const count = mounted ? getItemCount() : 0;

  return (
    <button
      className="relative w-10 h-10 rounded-full bg-dark text-white flex items-center justify-center hover:bg-secondary-dark transition-colors ml-1"
      onClick={openCart}
      aria-label={`Open cart with ${count} items`}
    >
      <ShoppingBag className="h-[18px] w-[18px]" />
      {mounted && count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-gold text-dark text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center border-2 border-cream">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
