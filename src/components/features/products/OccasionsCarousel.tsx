"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { ROUTES } from "@/constants/routes";
import { ASSETS } from "@/constants/assets";

const OCCASIONS_DATA = [
  {
    name: "Birthday",
    slug: "birthdays",
    image: ASSETS.OCCASIONS.BIRTHDAY,
    badge: "Celebrate",
    count: "140+ ideas",
  },
  {
    name: "Anniversary",
    slug: "anniversary",
    image: ASSETS.OCCASIONS.ANNIVERSARY,
    badge: "Milestones",
    count: "80+ romance gifts",
  },
  {
    name: "Wedding",
    slug: "weddings",
    image: ASSETS.OCCASIONS.WEDDING,
    badge: "Elegant",
    count: "85+ hampers",
  },
  {
    name: "Housewarming",
    slug: "housewarming",
    image: ASSETS.OCCASIONS.HOUSEWARMING,
    badge: "Cozy Home",
    count: "50+ home items",
  },
  {
    name: "Baby Shower",
    slug: "baby-shower",
    image: ASSETS.OCCASIONS.BABY_SHOWER,
    badge: "Sweetest",
    count: "40+ keepsake gifts",
  },
  {
    name: "Corporate Gifting",
    slug: "corporate",
    image: ASSETS.OCCASIONS.CORPORATE,
    badge: "Bulk Premium",
    count: "60+ curated sets",
  },
];

export function OccasionsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((api: any) => {
    setPrevBtnEnabled(api.canScrollPrev());
    setNextBtnEnabled(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="py-16 lg:py-20 bg-cream">
      <div className="page-container">
        <Reveal className="flex items-end justify-between mb-10">
          <div>
            <p className="text-gold-dark text-[11px] font-semibold tracking-[0.2em] uppercase mb-3">
              Celebration Collections
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-dark">
              Shop by Occasion
            </h2>
            <p className="text-warm-gray text-base md:text-lg mt-3 max-w-xl leading-relaxed">
              Find the perfect personalized tokens to celebrate life's most precious milestones.
            </p>
          </div>
          <Link
            href="/shop?view=occasions"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-dark hover:text-gold transition-colors"
          >
            View all occasions <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <div className="group relative w-full">
          <div className="overflow-hidden w-full px-1" ref={emblaRef}>
            <div className="flex -ml-4 md:-ml-5">
              {OCCASIONS_DATA.map((cat, index) => (
                <div
                  key={cat.slug}
                  className="flex-[0_0_80%] sm:flex-[0_0_45%] md:flex-[0_0_33.33%] pl-4 md:pl-5 min-w-0"
                >
                  <Link
                    href={ROUTES.CATEGORY(cat.slug)}
                    className="group/card relative rounded-3xl overflow-hidden aspect-[4/5] bg-muted block shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/30 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <span className="inline-block bg-gold text-dark text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full mb-3 shadow-sm">
                        {cat.badge}
                      </span>
                      <h3 className="font-display font-semibold text-white text-2xl leading-tight">
                        {cat.name}
                      </h3>
                      <p className="text-white/80 text-sm mt-1">{cat.count}</p>
                    </div>

                    <span className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white group-hover/card:bg-gold group-hover/card:text-dark group-hover/card:border-gold transition-all duration-300">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          {prevBtnEnabled && (
            <button
              onClick={scrollPrev}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm border border-border shadow-md flex items-center justify-center text-dark hover:bg-gold hover:text-dark hover:border-gold transition-all opacity-0 group-hover:opacity-100 duration-300 hidden md:flex"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {nextBtnEnabled && (
            <button
              onClick={scrollNext}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm border border-border shadow-md flex items-center justify-center text-dark hover:bg-gold hover:text-dark hover:border-gold transition-all opacity-0 group-hover:opacity-100 duration-300 hidden md:flex"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link
            href="/shop?view=occasions"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gold"
          >
            View all occasions <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
