"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ReviewsSection } from "@/components/features/reviews/ReviewsSection";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/formatters";
import { ROUTES } from "@/constants/routes";
import type { Product } from "@/types/product";
import type { Review } from "@/types/review";

interface Props {
  product: Product;
  reviews: Review[];
  related: Product[];
}

export function ProductTabs({ product, reviews, related }: Props) {
  const safeDescription = useMemo(() => {
    if (typeof window === "undefined") return product.description;
    return DOMPurify.sanitize(product.description, {
      USE_PROFILES: { html: true },
      ADD_TAGS: ["iframe"],
      ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "src", "width", "height"],
    });
  }, [product.description]);

  const hasSpecs = product.specifications && product.specifications.length > 0;

  return (
    <>
      <Tabs defaultValue="description" className="mt-12">
        <TabsList className="w-full grid grid-cols-3 h-10 rounded-full bg-cream border border-border p-1">
          <TabsTrigger
            value="description"
            className="rounded-full text-xs sm:text-sm font-medium text-warm-gray transition-all data-[state=active]:bg-gold data-[state=active]:text-dark data-[state=active]:shadow-sm data-[state=active]:font-semibold truncate"
          >
            Description
          </TabsTrigger>

          {hasSpecs ? (
            <TabsTrigger
              value="specs"
              className="rounded-full text-xs sm:text-sm font-medium text-warm-gray transition-all data-[state=active]:bg-gold data-[state=active]:text-dark data-[state=active]:shadow-sm data-[state=active]:font-semibold truncate"
            >
              Specs
            </TabsTrigger>
          ) : (
            <span />
          )}

          <TabsTrigger
            value="reviews"
            className="rounded-full text-xs sm:text-sm font-medium text-warm-gray transition-all data-[state=active]:bg-gold data-[state=active]:text-dark data-[state=active]:shadow-sm data-[state=active]:font-semibold"
          >
            Reviews
            {reviews.length > 0 && (
              <span className="ml-1 text-[10px] bg-dark/10 text-dark font-bold rounded-full px-1.5 py-0.5 leading-none hidden sm:inline">
                {reviews.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Description */}
        <TabsContent value="description" className="mt-5 focus-visible:outline-none">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div
              className="prose prose-sm max-w-none text-warm-gray
                prose-headings:text-dark prose-headings:font-semibold
                prose-h2:text-base prose-h3:text-sm
                prose-p:leading-relaxed prose-p:my-1
                prose-ul:my-1 prose-li:my-0.5
                prose-ol:my-1
                prose-strong:text-dark
                prose-img:rounded-xl prose-img:my-3 prose-img:w-full prose-img:max-w-sm
                [&_iframe]:w-full [&_iframe]:max-w-lg [&_iframe]:rounded-xl [&_iframe]:my-3
                [&_iframe]:h-[185px] [&_iframe]:sm:h-[260px] [&_iframe]:md:h-[340px]
                text-xs sm:text-sm"
              dangerouslySetInnerHTML={{ __html: safeDescription }}
            />

            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-border">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs text-warm-gray">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Specifications */}
        {hasSpecs && (
          <TabsContent value="specs" className="mt-5 focus-visible:outline-none">
            <div className="rounded-2xl border border-border overflow-hidden shadow-sm">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {product.specifications!.map((spec, i) => (
                    <tr
                      key={`${spec.key}-${i}`}
                      className={cn(
                        "border-b border-border last:border-0",
                        i % 2 === 0 ? "bg-white" : "bg-cream/30"
                      )}
                    >
                      <td className="px-5 py-3 font-medium text-dark w-1/3 border-r border-border bg-cream/40">
                        {spec.key}
                      </td>
                      <td className="px-5 py-3 text-warm-gray">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        )}

        {/* Reviews */}
        <TabsContent value="reviews" className="mt-5 focus-visible:outline-none">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <ReviewsSection reviews={reviews} productId={product.id} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-gold-dark text-[11px] font-semibold tracking-[0.2em] uppercase mb-1">
                You may also like
              </p>
              <h2 className="font-display text-2xl font-bold text-dark">
                More from this collection
              </h2>
            </div>
            <Link
              href={ROUTES.SHOP}
              className="hidden sm:inline-flex text-sm font-medium text-dark hover:text-gold transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((item) => (
              <Link
                key={item.id}
                href={ROUTES.PRODUCT(item.slug)}
                className="group rounded-2xl border border-border bg-white overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square bg-cream overflow-hidden">
                  {item.images[0] ? (
                    <Image
                      src={item.images[0]}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-cream" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-dark line-clamp-2 leading-snug">
                    {item.name}
                  </p>
                  <p className="text-sm font-bold text-dark mt-1">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
