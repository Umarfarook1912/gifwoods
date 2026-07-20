"use client";

import { Grid } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { cn } from "@/lib/utils/cn";
import type { Category } from "@/types/product";

interface CategoryFilterBarProps {
  categories: Category[];
  categoryCounts: Record<string, number>;
  totalCount: number;
  selectedCategoryId: string;
  onSelect: (categoryId: string) => void;
}

export function CategoryFilterBar({
  categories,
  categoryCounts,
  totalCount,
  selectedCategoryId,
  onSelect,
}: CategoryFilterBarProps) {
  return (
    <Reveal delay={1} className="mb-10">
      <div className="flex flex-row items-center gap-2.5 sm:gap-3 overflow-x-auto pb-3 pt-1 px-0.5 scrollbar-hide snap-x">
        <button
          type="button"
          onClick={() => onSelect("all")}
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
            {totalCount}
          </span>
        </button>

        {categories.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          const count = categoryCounts[category.id] || 0;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
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
  );
}
