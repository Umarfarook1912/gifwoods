import { ProductCard } from "@/components/shared/ProductCard";
import { Reveal } from "@/components/shared/Reveal";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types/product";

interface Props {
  products: Product[];
  loading?: boolean;
}

export function ProductGrid({ products, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-border">
            <Skeleton className="aspect-square w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-warm-gray text-lg">No products found</p>
        <p className="text-muted-foreground text-sm mt-2">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product, index) => (
        <Reveal key={product.id} delay={(index % 4) as 0 | 1 | 2 | 3}>
          <ProductCard product={product} />
        </Reveal>
      ))}
    </div>
  );
}
