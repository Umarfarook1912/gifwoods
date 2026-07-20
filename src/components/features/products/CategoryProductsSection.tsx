"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Grid } from "lucide-react";
import { ProductCard } from "@/components/shared/ProductCard";
import { Reveal } from "@/components/shared/Reveal";
import { cn } from "@/lib/utils/cn";
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

        {/* Categories Selector in Row Order (Text format boxes) */}
        <Reveal delay={1} className="mb-10">
          <div className="flex flex-row items-center gap-2.5 sm:gap-3 overflow-x-auto pb-3 pt-1 px-0.5 scrollbar-hide snap-x">
            {/* All Products Box */}
            <button
              type="button"
              onClick={() => setSelectedCategoryId("all")}
              className={cn(
                "snap-start inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-200 shrink-0 border cursor-pointer select-none",
                selectedCategoryId === "all"
                  ? "bg-dark text-white border-dark shadow-md ring-2 ring-gold/40"
                  : "bg-cream/50 text-dark border-border hover:border-gold/50 hover:bg-cream"
              )}
            >
              <Grid className="h-4 w-4 opacity-70" />
              <span>All Products</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-semibold transition-colors",
                  selectedCategoryId === "all"
                    ? "bg-gold text-dark font-bold"
                    : "bg-white/80 text-warm-gray border border-border/80"
                )}
              >
                {products.length}
              </span>
            </button>

            {/* Category Text Format Boxes */}
            {categories.map((category) => {
              const isSelected = selectedCategoryId === category.id;
              const count = categoryCounts[category.id] || 0;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={cn(
                    "snap-start inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-200 shrink-0 border cursor-pointer select-none",
                    isSelected
                      ? "bg-dark text-white border-dark shadow-md ring-2 ring-gold/40"
                      : "bg-cream/50 text-dark border-border hover:border-gold/50 hover:bg-cream"
                  )}
                >
                  <span>{category.name}</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-semibold transition-colors",
                      isSelected
                        ? "bg-gold text-dark font-bold"
                        : "bg-white/80 text-warm-gray border border-border/80"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product, index) => (
              <Reveal key={product.id} delay={(index % 4) as 0 | 1 | 2 | 3}>
                <ProductCard product={product} className="h-full" />
              </Reveal>
            ))}
          </div>
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
              View All Products
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
