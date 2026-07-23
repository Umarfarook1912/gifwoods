import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { ROUTES } from "@/constants/routes";
import type { Category } from "@/types/product";

const CATEGORY_META: Record<string, { badge: string; count: string }> = {
  personalized: { badge: "Signature", count: "120+ gifts" },
  weddings: { badge: "Bestseller", count: "85+ hampers" },
  corporate: { badge: "Bulk pricing", count: "60+ curated sets" },
  birthdays: { badge: "New", count: "140+ ideas" },
};

const CATEGORY_ORDER = ["personalized", "weddings", "corporate", "birthdays"];

interface Props {
  categories: Category[];
}

export function CategoriesGrid({ categories }: Props) {
  const displayed = CATEGORY_ORDER
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is Category => Boolean(c))
    .concat(categories.filter((c) => !CATEGORY_ORDER.includes(c.slug)))
    .slice(0, 4);

  return (
    <section className="py-16 lg:py-20 bg-cream">
      <div className="page-container">
        <Reveal className="flex items-end justify-between mb-10">
          <div>
            <p className="text-gold-dark text-[11px] font-semibold tracking-[0.2em] uppercase mb-3">
              Curated Categories
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-dark">
              Gifts for every moment
            </h2>
          </div>
          <Link
            href="/shop?view=categories"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-dark hover:text-gold transition-colors"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {displayed.map((cat, index) => {
            const meta = CATEGORY_META[cat.slug];
            return (
              <Reveal key={cat.id} delay={(index % 4) as 0 | 1 | 2 | 3}>
              <Link
                href={ROUTES.CATEGORY(cat.slug)}
                className="group relative rounded-3xl overflow-hidden aspect-[3/4] bg-muted block"
              >
                {cat.image_url && (
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  {meta && (
                    <span className="inline-block bg-gold text-dark text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full mb-2.5">
                      {meta.badge}
                    </span>
                  )}
                  <h3 className="font-display font-semibold text-white text-xl leading-tight">
                    {cat.name}
                  </h3>
                  {meta && (
                    <p className="text-white/70 text-sm mt-0.5">{meta.count}</p>
                  )}
                </div>

                <span className="absolute bottom-5 right-5 w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white group-hover:bg-gold group-hover:text-dark group-hover:border-gold transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              </Reveal>
            );
          })}
        </div>

        <div className="text-center mt-6 sm:hidden">
          <Link
            href="/shop?view=categories"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gold"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
