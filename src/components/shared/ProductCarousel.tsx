"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function ProductCarousel({ children, className }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
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

  // Autoplay effect
  useEffect(() => {
    if (!emblaApi) return;

    let intervalId: NodeJS.Timeout;

    const startAutoplay = () => {
      intervalId = setInterval(() => {
        emblaApi.scrollNext();
      }, 4000); // Autoplay slide transition every 4 seconds
    };

    const stopAutoplay = () => {
      clearInterval(intervalId);
    };

    startAutoplay();

    emblaApi.on("pointerDown", stopAutoplay);
    emblaApi.on("pointerUp", startAutoplay);

    return () => {
      clearInterval(intervalId);
      if (emblaApi) {
        emblaApi.off("pointerDown", stopAutoplay);
        emblaApi.off("pointerUp", startAutoplay);
      }
    };
  }, [emblaApi]);

  return (
    <div className={cn("group relative w-full", className)}>
      <div className="overflow-hidden w-full px-1" ref={emblaRef}>
        <div className="flex -ml-4 md:-ml-5">
          {React.Children.map(children, (child) => (
            <div className="flex-[0_0_80%] sm:flex-[0_0_45%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%] pl-4 md:pl-5 min-w-0">
              {child}
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
  );
}
