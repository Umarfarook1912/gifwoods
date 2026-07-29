"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Truck, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductShareButton } from "./ProductShareButton";
import { ProductAdminEdit } from "./ProductAdminEdit";
import { StarRating } from "@/components/shared/StarRating";
import { useCartStore } from "@/hooks/useCartStore";
import { formatPrice, formatDiscount } from "@/lib/utils/formatters";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/types/product";

interface Props {
  product: Product;
}

export function ProductDetailClient({ product: initialProduct }: Props) {
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct);
  const [quantity, setQuantity] = useState(1);
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product, 1);
    }
    openCart();
    toast.success(`${product.name} added to cart!`);
  };

  const discount =
    product.original_price && product.original_price > product.price
      ? formatDiscount(product.original_price, product.price)
      : null;

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-sm font-medium text-warm-gray hover:text-dark transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      <ProductImageGallery images={product.images} name={product.name} />

      <div>
        <div className="flex items-center gap-2 mb-3">
          {product.category && (
            <Badge variant="outline" className="text-warm-gray border-border">
              {product.category.name}
            </Badge>
          )}
          {product.badge && (
            <Badge className="bg-gold/10 text-gold border-gold/30">
              {product.badge}
            </Badge>
          )}
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-dark mb-3">
          {product.name}
        </h1>

        {product.avg_rating && (
          <div className="flex items-center gap-2 mb-4">
            <StarRating rating={product.avg_rating} size="sm" />
            <span className="text-sm font-semibold text-dark">{product.avg_rating}</span>
            <span className="text-sm text-muted-foreground">
              · {product.review_count} reviews
            </span>
          </div>
        )}

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
          <span
            className={cn(
              "text-xs",
              product.stock < 10 ? "text-red-600 font-medium" : "text-muted-foreground"
            )}
          >
            {product.stock < 10
              ? `Only ${product.stock} left!`
              : `${product.stock} in stock`}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            className="flex-1 min-w-[10rem] bg-gold text-dark hover:bg-gold-dark font-semibold h-12"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
          <ProductShareButton name={product.name} description={product.description} />
          <ProductAdminEdit product={product} onUpdated={setProduct} />
        </div>

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

        <div>
          <h3 className="font-semibold text-dark mb-2">About this gift</h3>
          <p className="text-sm text-warm-gray leading-relaxed">{product.description}</p>
        </div>

        {product.specifications && product.specifications.length > 0 && (
          <div className="mt-6 border-t border-border pt-6">
            <h3 className="font-semibold text-dark mb-3">Specifications</h3>
            <div className="border border-border rounded-2xl overflow-hidden bg-cream/30">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {product.specifications.map((spec, i) => (
                    <tr
                      key={`${spec.key}-${i}`}
                      className={cn(
                        "border-b border-border last:border-0",
                        i % 2 === 0 ? "bg-white" : "bg-cream/10"
                      )}
                    >
                      <td className="px-4 py-2.5 font-medium text-dark w-1/3 border-r border-border bg-cream/20">
                        {spec.key}
                      </td>
                      <td className="px-4 py-2.5 text-warm-gray">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs text-warm-gray">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
