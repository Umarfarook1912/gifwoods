"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/shared/ProductCard";
import { Reveal } from "@/components/shared/Reveal";
import { CategoryFilterBar } from "./CategoryFilterBar";
import { ViewAllProductsPagination } from "./ViewAllProductsPagination";
import { cn } from "@/lib/utils/cn";
import { ROUTES } from "@/constants/routes";
import {
  HOME_EXPLORE_PRODUCTS_DESKTOP,
  HOME_EXPLORE_PRODUCTS_MOBILE,
  HOME_VIEW_ALL_PRODUCTS_LABEL,
} from "@/constants/ui";
import type { Category, Product } from "@/types/product";

interface CategoryProductsSectionProps {
  categories: Category[];
  products: Product[];
}

export function CategoryProductsSection({
  categories,
  products,
}: CategoryProductsSectionProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  // Calculate product counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const catId = p.category_id || p.category?.id;
      if (catId) {
        counts[catId] = (counts[catId] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  // Filter products based on selected category
  const filteredProducts = useMemo(() => {
    if (selectedCategoryId === "all") {
      return products;
    }
    return products.filter(
      (p) =>
        p.category_id === selectedCategoryId ||
        p.category?.id === selectedCategoryId
    );
  }, [selectedCategoryId, products]);

  // Selected category object
  const selectedCategoryObj = useMemo(() => {
    if (selectedCategoryId === "all") return null;
    return categories.find((c) => c.id === selectedCategoryId) ?? null;
  }, [selectedCategoryId, categories]);

  const displayedProducts = useMemo(
    () => filteredProducts.slice(0, HOME_EXPLORE_PRODUCTS_DESKTOP),
    [filteredProducts]
  );

  const showViewAllRow =
    filteredProducts.length > HOME_EXPLORE_PRODUCTS_MOBILE;

  const viewAllHref = selectedCategoryObj
    ? `${ROUTES.SHOP}?category=${selectedCategoryObj.slug}`
    : ROUTES.SHOP;

  const mobileShown = Math.min(HOME_EXPLORE_PRODUCTS_MOBILE, filteredProducts.length);
  const desktopShown = Math.min(HOME_EXPLORE_PRODUCTS_DESKTOP, filteredProducts.length);

  return (
    <section className="py-16 lg:py-20 bg-white border-t border-border/60">
      <div className="page-container">
        {/* Header */}
        <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-gold-dark text-[11px] font-semibold tracking-[0.2em] uppercase mb-2">
              Browse Collections
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-dark">
              Explore Our Products
            </h2>
            <p className="text-warm-gray text-sm mt-2 max-w-xl">
              Choose a category below to explore personalized gifts crafted with care.
            </p>
          </div>
          {selectedCategoryObj ? (
            <Link
              href={`/shop?category=${selectedCategoryObj.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-dark hover:text-gold transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              View all {selectedCategoryObj.name} gifts <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-dark hover:text-gold transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              Explore full shop <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </Reveal>

        <CategoryFilterBar
          categories={categories}
          categoryCounts={categoryCounts}
          totalCount={products.length}
          selectedCategoryId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />

        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {displayedProducts.map((product, index) => (
                <Reveal
                  key={product.id}
                  delay={(index % 4) as 0 | 1 | 2 | 3}
                  className={cn(
                    index >= HOME_EXPLORE_PRODUCTS_MOBILE && "hidden lg:block"
                  )}
                >
                  <ProductCard product={product} className="h-full" />
                </Reveal>
              ))}
            </div>
            {showViewAllRow && (
              <Reveal delay={3}>
                <ViewAllProductsPagination
                  href={viewAllHref}
                  totalCount={filteredProducts.length}
                  mobileShown={mobileShown}
                  desktopShown={desktopShown}
                />
              </Reveal>
            )}
          </>
        ) : (
          <div className="text-center py-16 px-4 bg-cream/40 rounded-3xl border border-dashed border-border/80">
            <p className="text-dark font-display font-semibold text-lg">
              No products found in this category
            </p>
            <p className="text-warm-gray text-sm mt-1 max-w-sm mx-auto">
              Check back soon for new arrivals or select another category above.
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategoryId("all")}
              className="mt-4 inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-gold text-dark hover:bg-gold-dark transition-colors cursor-pointer"
            >
              {HOME_VIEW_ALL_PRODUCTS_LABEL}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
