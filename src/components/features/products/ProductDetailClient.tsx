"use client";

import { useState } from "react";
import { ShoppingBag, Heart, Share2, Star, Truck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ProductImageGallery } from "./ProductImageGallery";
import { StarRating } from "@/components/shared/StarRating";
import { useCartStore } from "@/hooks/useCartStore";
import { formatPrice, formatDiscount } from "@/lib/utils/formatters";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/types/product";
import type { Customization } from "@/types/product";

interface Props {
  product: Product;
}

export function ProductDetailClient({ product }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState<Customization>({});
  const { addItem, openCart } = useCartStore();

  const hasPersonalization = product.badge === "Personalize";

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product, 1, hasPersonalization ? customization : undefined);
    }
    openCart();
    toast.success(`${product.name} added to cart!`);
  };

  const discount =
    product.original_price && product.original_price > product.price
      ? formatDiscount(product.original_price, product.price)
      : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      {/* Image Gallery */}
      <ProductImageGallery images={product.images} name={product.name} />

      {/* Details */}
      <div>
        {product.badge && (
          <Badge className="mb-3 bg-gold/10 text-gold border-gold/30">
            {product.badge}
          </Badge>
        )}
        <h1 className="font-display text-2xl md:text-3xl font-bold text-dark mb-3">
          {product.name}
        </h1>

        {/* Rating */}
        {product.avg_rating && (
          <div className="flex items-center gap-2 mb-4">
            <StarRating rating={product.avg_rating} size="sm" />
            <span className="text-sm font-semibold text-dark">{product.avg_rating}</span>
            <span className="text-sm text-muted-foreground">
              · {product.review_count} reviews
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-3 mb-6">
          <span className="font-display font-bold text-3xl text-dark">
            {formatPrice(product.price)}
          </span>
          {product.original_price && product.original_price > product.price && (
            <>
              <span className="text-warm-gray line-through text-lg">
                {formatPrice(product.original_price)}
              </span>
              <Badge className="bg-red-100 text-red-700 border-0 text-xs font-semibold">
                {discount}
              </Badge>
            </>
          )}
        </div>

        <Separator className="mb-6" />

        {/* Personalization */}
        {hasPersonalization && (
          <div className="mb-6 p-4 rounded-xl border border-gold/20 bg-gold/5 space-y-3">
            <h3 className="font-semibold text-dark text-sm">Personalize this gift</h3>
            <div>
              <Label htmlFor="custom-name" className="text-xs font-medium text-warm-gray mb-1">
                Name to engrave
              </Label>
              <Input
                id="custom-name"
                placeholder="e.g. Priya & Arjun"
                maxLength={50}
                value={customization.name ?? ""}
                onChange={(e) => setCustomization({ ...customization, name: e.target.value })}
                className="border-gold/30 focus-visible:ring-gold bg-white"
              />
            </div>
            <div>
              <Label htmlFor="custom-message" className="text-xs font-medium text-warm-gray mb-1">
                Message (optional)
              </Label>
              <Input
                id="custom-message"
                placeholder="Your heartfelt message..."
                maxLength={100}
                value={customization.message ?? ""}
                onChange={(e) => setCustomization({ ...customization, message: e.target.value })}
                className="border-gold/30 focus-visible:ring-gold bg-white"
              />
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="flex items-center gap-3 mb-6">
          <Label className="text-sm font-medium text-dark">Quantity</Label>
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 hover:bg-muted transition-colors text-sm"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="px-4 py-2 text-sm font-semibold border-x border-border min-w-[3rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="px-3 py-2 hover:bg-muted transition-colors text-sm"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <span className={cn("text-xs", product.stock < 10 ? "text-red-600 font-medium" : "text-muted-foreground")}>
            {product.stock < 10
              ? `Only ${product.stock} left!`
              : `${product.stock} in stock`}
          </span>
        </div>

        {/* CTA */}
        <div className="flex gap-3 mb-6">
          <Button
            className="flex-1 bg-gold text-dark hover:bg-gold-dark font-semibold h-12"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
          <Button variant="outline" size="icon" className="h-12 w-12 border-border hover:border-gold">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-12 w-12 border-border hover:border-gold">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Perks */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Truck, text: "Free gift wrap · Insured shipping" },
            { icon: Shield, text: "Secure payment · Easy returns" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs text-warm-gray">
              <Icon className="h-4 w-4 text-gold flex-shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        {/* Description */}
        <div>
          <h3 className="font-semibold text-dark mb-2">About this gift</h3>
          <p className="text-sm text-warm-gray leading-relaxed">{product.description}</p>
        </div>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs text-warm-gray">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
