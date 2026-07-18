"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import type { Category } from "@/types/product";

const PRICE_RANGES = [
  { label: "Under ₹1,000", min: 0, max: 1000 },
  { label: "₹1,000 – ₹2,500", min: 1000, max: 2500 },
  { label: "₹2,500 – ₹5,000", min: 2500, max: 5000 },
  { label: "₹5,000+", min: 5000, max: 50000 },
];

interface Props {
  categories: Category[];
}

export function ProductFilters({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams]
  );

  const activeCategory = searchParams.get("category");
  const hasFilters = activeCategory || searchParams.get("minPrice");

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-dark">Filters</h3>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-destructive h-auto p-0"
            onClick={() => router.push("/shop")}
          >
            <X className="h-3 w-3 mr-1" /> Clear all
          </Button>
        )}
      </div>

      <Separator />

      {/* Categories */}
      <div>
        <h4 className="text-sm font-semibold text-dark mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${cat.slug}`}
                checked={activeCategory === cat.slug}
                onCheckedChange={(checked) =>
                  setParam("category", checked ? cat.slug : null)
                }
              />
              <Label
                htmlFor={`cat-${cat.slug}`}
                className="text-sm text-secondary-dark cursor-pointer hover:text-gold transition-colors"
              >
                {cat.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price */}
      <div>
        <h4 className="text-sm font-semibold text-dark mb-3">Price Range</h4>
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => {
            const isActive =
              searchParams.get("minPrice") === String(range.min) &&
              searchParams.get("maxPrice") === String(range.max);
            return (
              <div key={range.label} className="flex items-center gap-2">
                <Checkbox
                  id={`price-${range.min}`}
                  checked={isActive}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set("minPrice", String(range.min));
                      params.set("maxPrice", String(range.max));
                      params.delete("page");
                      router.push(`/shop?${params.toString()}`);
                    } else {
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete("minPrice");
                      params.delete("maxPrice");
                      router.push(`/shop?${params.toString()}`);
                    }
                  }}
                />
                <Label
                  htmlFor={`price-${range.min}`}
                  className="text-sm text-secondary-dark cursor-pointer hover:text-gold transition-colors"
                >
                  {range.label}
                </Label>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
