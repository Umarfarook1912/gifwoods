"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProductFilters } from "./ProductFilters";
import { SHOP_FILTERS_LABEL } from "@/constants/ui";
import type { Category } from "@/types/product";

interface MobileProductFiltersProps {
  categories: Category[];
}

export function MobileProductFilters({ categories }: MobileProductFiltersProps) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const activeFilterCount = [
    searchParams.get("category"),
    searchParams.get("minPrice"),
  ].filter(Boolean).length;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="lg:hidden w-full sm:w-auto gap-2 border-border bg-cream hover:bg-gold/10"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="h-4 w-4" />
        {SHOP_FILTERS_LABEL}
        {activeFilterCount > 0 && (
          <span className="rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-bold text-dark">
            {activeFilterCount}
          </span>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-80 overflow-y-auto bg-cream">
          <SheetHeader className="border-b border-border pb-4">
            <SheetTitle className="font-display text-dark">
              {SHOP_FILTERS_LABEL}
            </SheetTitle>
          </SheetHeader>
          <div className="px-1 py-4">
            <ProductFilters categories={categories} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
