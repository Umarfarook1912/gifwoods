import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/shared/ProductCard";
import { Reveal } from "@/components/shared/Reveal";
import { ROUTES } from "@/constants/routes";
import type { Product } from "@/types/product";

interface Props {
  products: Product[];
}

export function BestsellersSection({ products }: Props) {
  if (!products.length) return null;

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="page-container">
        <Reveal className="flex items-end justify-between mb-10">
          <div>
            <p className="text-gold-dark text-[11px] font-semibold tracking-[0.2em] uppercase mb-3">
              Bestsellers
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-dark">
              Loved by our gifters
            </h2>
          </div>
          <Link
            href={ROUTES.BESTSELLERS}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-dark hover:text-gold transition-colors"
          >
            Shop all <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={(index % 4) as 0 | 1 | 2 | 3}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link
            href={ROUTES.BESTSELLERS}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gold"
          >
            Shop all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
