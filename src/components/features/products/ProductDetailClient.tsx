"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Truck, Shield, ArrowLeft, Mail } from "lucide-react";
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
import { SOCIAL_LINKS, SITE_NAME } from "@/constants/ui";
import { InstagramIcon, YoutubeIcon } from "@/components/ui/SocialIcons";
import type { Product } from "@/types/product";

interface Props {
  product: Product;
}

export function ProductDetailClient({ product: initialProduct }: Props) {
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct);
  const [quantity, setQuantity] = useState(1);
  const { addItem, openCart } = useCartStore();
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setProduct(initialProduct);
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
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

        {/* Social Sharing & Follow Links */}
        <div className="mb-6 flex flex-col gap-2">
          <p className="text-[11px] font-bold tracking-wider text-gold uppercase">
            Share / Follow Us
          </p>
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Share on WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this beautiful gift: ${product.name} - ${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Share on WhatsApp"
              className="w-9 h-9 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center text-dark/70 transition-all duration-300 transform hover:scale-105 hover:border-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/10"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.517 2.266 2.27 3.51 5.276 3.508 8.479-.005 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.453L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.864-9.83.002-2.623-1.023-5.086-2.887-6.948C16.572 1.954 14.11 1.928 11.99 1.928c-5.444 0-9.87 4.413-9.874 9.83-.001 2.03.541 4.015 1.57 5.762l-.97 3.546 3.633-.951zM17.8 14.73c-.318-.16-1.884-.93-2.175-1.038-.29-.108-.503-.16-.714.16-.21.32-.816.103-1.002.32-.186.216-.372.24-.69.08-.318-.16-1.342-.494-2.558-1.578-.946-.844-1.586-1.886-1.772-2.206-.186-.32-.02-.493.14-.652.143-.143.318-.372.477-.558.16-.186.213-.318.318-.53.106-.214.053-.4-.027-.558-.08-.16-.714-1.72-.977-2.357-.257-.618-.518-.53-.714-.54l-.608-.01c-.21 0-.553.08-.84.398-.29.32-1.107 1.08-1.107 2.63 0 1.55 1.13 3.05 1.282 3.262.155.213 2.22 3.39 5.378 4.754.75.324 1.337.518 1.795.663.754.24 1.44.207 1.984.126.607-.09 1.884-.77 2.15-1.514.265-.744.265-1.38.185-1.514-.078-.135-.29-.215-.608-.376z"/>
              </svg>
            </a>

            {/* Share on Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Share on Facebook"
              className="w-9 h-9 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center text-dark/70 transition-all duration-300 transform hover:scale-105 hover:border-[#1877F2] hover:text-[#1877F2] hover:bg-[#1877F2]/10"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
              </svg>
            </a>

            {/* Share on X */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this beautiful gift: ${product.name}`)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Share on X"
              className="w-9 h-9 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center text-dark/70 transition-all duration-300 transform hover:scale-105 hover:border-black hover:text-black hover:bg-black/10"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            {/* Share via Email */}
            <a
              href={`mailto:?subject=${encodeURIComponent(`Beautiful Gift: ${product.name}`)}&body=${encodeURIComponent(`Check out this beautiful gift from ${SITE_NAME}: ${product.name} at ${shareUrl}`)}`}
              title="Share via Email"
              className="w-9 h-9 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center text-dark/70 transition-all duration-300 transform hover:scale-105 hover:border-gold hover:text-gold hover:bg-gold/10"
            >
              <Mail className="h-4 w-4" />
            </a>

            <span className="h-5 w-px bg-gold/20 mx-1 shrink-0" />

            {/* Follow Instagram */}
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              title="Follow us on Instagram"
              className="w-9 h-9 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center text-dark/70 transition-all duration-300 transform hover:scale-105 hover:border-[#E4405F] hover:text-[#E4405F] hover:bg-[#E4405F]/10"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>

            {/* Subscribe on YouTube */}
            <a
              href={SOCIAL_LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              title="Subscribe on YouTube"
              className="w-9 h-9 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center text-dark/70 transition-all duration-300 transform hover:scale-105 hover:border-[#FF0000] hover:text-[#FF0000] hover:bg-[#FF0000]/10"
            >
              <YoutubeIcon className="h-4 w-4" />
            </a>
          </div>
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
