import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/types/product";

const CATEGORY_META: Record<string, { badge: string; count: string }> = {
  personalized: { badge: "Personalized", count: "120+ gifts" },
  weddings: { badge: "Weddings", count: "85+ hampers" },
  corporate: { badge: "Corporate", count: "60+ curated sets" },
  birthdays: { badge: "Birthday", count: "140+ ideas" },
};

interface Props {
  categories: Category[];
}

export function CategoriesGrid({ categories }: Props) {
  const displayed = categories.slice(0, 4);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-gold text-sm font-semibold tracking-wider uppercase mb-2">
              Curated Categories
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-dark">
              Gifts for every moment
            </h2>
          </div>
          <Button variant="ghost" className="text-gold hover:text-gold-dark hidden sm:flex" asChild>
            <Link href="/shop?view=categories">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayed.map((cat) => {
            const meta = CATEGORY_META[cat.slug];
            return (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-muted block"
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
                <div className="absolute inset-0 bg-dark-gradient" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  {meta && (
                    <div className="flex gap-1.5 flex-wrap mb-2">
                      <Badge className="bg-gold/20 text-gold border-gold/30 text-[10px]">
                        {meta.badge}
                      </Badge>
                      <Badge variant="outline" className="border-white/30 text-white text-[10px]">
                        {meta.count}
                      </Badge>
                    </div>
                  )}
                  <h3 className="font-display font-semibold text-white text-lg leading-tight">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-6 sm:hidden">
          <Button variant="ghost" className="text-gold" asChild>
            <Link href="/shop?view=categories">View all categories</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
