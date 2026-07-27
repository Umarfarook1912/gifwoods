"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { CATEGORIES_MENU } from "@/constants/ui";
import { ROUTES } from "@/constants/routes";
import { getCategoryHref } from "./nav-utils";
import type { Category } from "@/types/product";

interface Props {
  categories: Category[];
  onNavigate?: () => void;
}

function columnCount(total: number): number {
  if (total >= CATEGORIES_MENU.WIDE_THRESHOLD) return CATEGORIES_MENU.COLUMNS_WIDE;
  if (total >= CATEGORIES_MENU.MEDIUM_THRESHOLD) return CATEGORIES_MENU.COLUMNS_MEDIUM;
  return 1;
}

export function CategoriesMegaMenu({ categories, onNavigate }: Props) {
  const cols = columnCount(categories.length);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-cream shadow-lg overflow-hidden",
        cols === 1 && "w-56",
        cols === 2 && "w-[28rem]",
        cols === 3 && "w-[40rem]"
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warm-gray">
          {CATEGORIES_MENU.TITLE}
        </p>
        <Link
          href={ROUTES.SHOP}
          onClick={onNavigate}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gold hover:text-gold-dark transition-colors"
        >
          {CATEGORIES_MENU.VIEW_ALL}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div
        className={cn(
          "grid gap-x-2 gap-y-0.5 p-2 max-h-[min(22rem,70vh)] overflow-y-auto scrollbar-hide",
          cols === 1 && "grid-cols-1",
          cols === 2 && "grid-cols-2",
          cols === 3 && "grid-cols-3"
        )}
      >
        {categories.map((category) => (
          <Link
            key={category.id}
            href={getCategoryHref(category.slug)}
            onClick={onNavigate}
            className="rounded-xl px-3 py-2.5 text-sm font-medium text-secondary-dark hover:bg-gold/15 hover:text-gold transition-colors"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
