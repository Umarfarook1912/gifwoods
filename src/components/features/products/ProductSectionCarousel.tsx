import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductCarousel } from "@/components/shared/ProductCarousel";
import { Reveal } from "@/components/shared/Reveal";
import type { Product } from "@/types/product";

interface Props {
  title: string;
  subtitle: string;
  products: Product[];
  viewAllHref: string;
  bgClass?: string;
  badgeLabel?: string;
}

export function ProductSectionCarousel({
  title,
  subtitle,
  products,
  viewAllHref,
  bgClass = "bg-white",
  badgeLabel,
}: Props) {
  // If there are no products, don't crash
  if (!products || products.length === 0) return null;

  return (
    <section className={`py-16 lg:py-20 ${bgClass}`}>
      <div className="page-container">
        <Reveal className="flex items-end justify-between mb-10">
          <div>
            {badgeLabel && (
              <p className="text-gold-dark text-[11px] font-semibold tracking-[0.2em] uppercase mb-3">
                {badgeLabel}
              </p>
            )}
            <h2 className="font-display text-3xl md:text-4xl font-bold text-dark">
              {title}
            </h2>
            <p className="text-warm-gray text-sm mt-2 max-w-xl">
              {subtitle}
            </p>
          </div>
          <Link
            href={viewAllHref}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-dark hover:text-gold transition-colors"
          >
            Shop all <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <ProductCarousel>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} className="h-full" />
          ))}
        </ProductCarousel>

        <div className="text-center mt-8 sm:hidden">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gold"
          >
            Shop all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
