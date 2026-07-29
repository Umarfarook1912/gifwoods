"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/formatters";
import { ROUTES } from "@/constants/routes";
import { useCartStore } from "@/hooks/useCartStore";
import { toast } from "sonner";
import type { Product } from "@/types/product";

const BADGE_LABELS: Record<string, string> = {
  Personalize: "Personalized",
  Bestseller: "Bestseller",
  New: "New",
  Limited: "Limited",
};

interface Props {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: Props) {
  const { addItem, openCart } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    openCart();
    toast.success(`${product.name} added to cart`, {
      description: "Added to your cart!",
    });
  };

  return (
    <div className={cn("group relative", className)}>
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted">
        <Link href={ROUTES.PRODUCT(product.slug)} className="absolute inset-0 block">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-cream">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
        </Link>

        {product.badge && (
          <span className="pointer-events-none absolute top-4 left-4 z-[1] bg-white/90 backdrop-blur-sm text-dark text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full">
            {BADGE_LABELS[product.badge] ?? product.badge}
          </span>
        )}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="absolute bottom-4 left-4 right-4 z-[2] bg-gold text-dark text-sm font-semibold py-2.5 rounded-full opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 hover:bg-gold-dark disabled:opacity-50"
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>

      <Link href={ROUTES.PRODUCT(product.slug)} className="block pt-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          {product.avg_rating ? (
            <>
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
              <span className="text-xs font-semibold text-dark">{product.avg_rating}</span>
            </>
          ) : (
            <Star className="h-3.5 w-3.5 text-border" />
          )}
        </div>

        <h3 className="font-display font-semibold text-dark text-base leading-snug mb-1.5 line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2">
          <span className="font-bold text-dark">{formatPrice(product.price)}</span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-sm text-warm-gray line-through">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
