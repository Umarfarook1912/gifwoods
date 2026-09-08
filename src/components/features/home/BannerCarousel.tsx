"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BannerCarouselSlide } from "@/components/features/home/BannerCarouselSlide";
import { HOMEPAGE_CAROUSEL_COPY } from "@/constants/homepage-carousel";
import { cn } from "@/lib/utils/cn";
import type {
  HomepageCarouselSlide as Slide,
  HomepageCarouselSlot,
} from "@/types/homepage-carousel";

interface Props {
  slides: Slide[];
  slot: HomepageCarouselSlot;
  className?: string;
  ariaLabel: string;
  compact?: boolean;
}

export function BannerCarousel({
  slides,
  slot,
  className,
  ariaLabel,
  compact = false,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: slides.length > 1,
    align: "start",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback((api: { selectedScrollSnap: () => number }) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || slides.length <= 1) return;

    let intervalId: ReturnType<typeof setInterval>;
    const startAutoplay = () => {
      intervalId = setInterval(() => emblaApi.scrollNext(), HOMEPAGE_CAROUSEL_COPY.AUTOPLAY_MS);
    };
    const stopAutoplay = () => clearInterval(intervalId);

    startAutoplay();
    emblaApi.on("pointerDown", stopAutoplay);
    emblaApi.on("pointerUp", startAutoplay);

    return () => {
      clearInterval(intervalId);
      emblaApi.off("pointerDown", stopAutoplay);
      emblaApi.off("pointerUp", startAutoplay);
    };
  }, [emblaApi, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className={cn(
        "group relative h-full w-full overflow-hidden rounded-2xl border border-border/60 shadow-lg ring-1 ring-dark/5",
        className
      )}
      aria-label={ariaLabel}
    >
      <div className="absolute inset-0 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide) => (
            <BannerCarouselSlide
              key={slide.id}
              slide={slide}
              slot={slot}
              compact={compact}
            />
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-dark/40 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100 hover:bg-gold hover:text-dark md:flex"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-dark/40 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100 hover:bg-gold hover:text-dark md:flex"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute right-3 top-3 z-10 flex gap-1.5">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => emblaApi?.scrollTo(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === selectedIndex
                    ? "w-5 bg-gold"
                    : "w-1.5 bg-white/55 hover:bg-white/80"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
