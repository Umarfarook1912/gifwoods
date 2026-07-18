import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/ProductCard";
import type { Product } from "@/types/product";

interface Props {
  products: Product[];
}

export function BestsellersSection({ products }: Props) {
  return (
    <section className="py-16 bg-cream">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-gold text-sm font-semibold tracking-wider uppercase mb-2">
              Bestsellers
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-dark">
              Loved by our gifters
            </h2>
          </div>
          <Button variant="ghost" className="text-gold hover:text-gold-dark hidden sm:flex" asChild>
            <Link href="/shop">
              Shop all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Button variant="ghost" className="text-gold" asChild>
            <Link href="/shop">Shop all</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
