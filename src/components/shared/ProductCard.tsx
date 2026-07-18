"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { formatPrice, formatDiscount } from "@/lib/utils/formatters";
import { ROUTES } from "@/constants/routes";
import { useCartStore } from "@/hooks/useCartStore";
import { toast } from "sonner";
import type { Product } from "@/types/product";

const BADGE_STYLES: Record<string, string> = {
  Personalize: "bg-gold/10 text-gold border-gold/30",
  Bestseller: "bg-secondary-dark/10 text-secondary-dark border-secondary-dark/30",
  New: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Limited: "bg-red-50 text-red-700 border-red-200",
};

interface Props {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: Props) {
  const { addItem, openCart } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    openCart();
    toast.success(`${product.name} added to cart`, {
      description: "Complimentary gift wrap included!",
    });
  };

  const discount =
    product.original_price && product.original_price > product.price
      ? formatDiscount(product.original_price, product.price)
      : null;

  return (
    <div className={cn("group relative bg-white rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300", className)}>
      <Link href={ROUTES.PRODUCT(product.slug)}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-cream">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.badge && (
              <Badge
                variant="outline"
                className={cn("text-[10px] font-semibold px-2 py-0.5 backdrop-blur-sm", BADGE_STYLES[product.badge])}
              >
                {product.badge}
              </Badge>
            )}
            {discount && (
              <Badge className="bg-red-500 text-white text-[10px] font-semibold border-0">
                {discount}
              </Badge>
            )}
          </div>

          {/* Free wrap badge */}
          <div className="absolute bottom-3 right-3">
            <Badge variant="secondary" className="text-[9px] bg-white/90 text-warm-gray border-0 shadow-sm">
              Free wrap
            </Badge>
          </div>

          {/* Wishlist */}
          <button
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-gold transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Add to wishlist"
            onClick={(e) => e.preventDefault()}
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          {/* Rating */}
          {product.avg_rating && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-3 w-3 fill-gold text-gold" />
              <span className="text-xs font-semibold text-dark">{product.avg_rating}</span>
              {product.review_count && (
                <span className="text-xs text-muted-foreground">· {product.review_count} reviews</span>
              )}
            </div>
          )}

          <h3 className="font-display font-semibold text-dark text-sm leading-snug mb-3 line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-dark">{formatPrice(product.price)}</span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <Button
          className="w-full bg-dark text-white hover:bg-secondary-dark text-xs font-semibold transition-colors"
          size="sm"
          onClick={handleAddToCart}
        >
          <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
