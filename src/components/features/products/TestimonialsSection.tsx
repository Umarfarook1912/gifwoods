"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "@/components/shared/StarRating";
import { Reveal } from "@/components/shared/Reveal";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import type { Review } from "@/types/review";

interface Props {
  reviews: Review[];
}

export function TestimonialsSection({ reviews }: Props) {
  // If there are no reviews, hide the section
  if (!reviews || reviews.length === 0) return null;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: reviews.length > 1,
    slidesToScroll: 1,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onInit = useCallback((api: any) => {
    setScrollSnaps(api.scrollSnapList());
  }, []);

  const onSelect = useCallback((api: any) => {
    setSelectedIndex(api.selectedScrollSnap());
    setPrevBtnEnabled(api.canScrollPrev());
    setNextBtnEnabled(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("reInit", onInit);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onInit, onSelect]);

  // Autoplay effect
  useEffect(() => {
    if (!emblaApi || reviews.length <= 1) return;

    let intervalId: NodeJS.Timeout;

    const startAutoplay = () => {
      intervalId = setInterval(() => {
        emblaApi.scrollNext();
      }, 4500);
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
  }, [emblaApi, reviews.length]);

  return (
    <section className="py-16 lg:py-20 bg-cream">
      <div className="page-container">
        <Reveal className="text-center mb-12">
          <p className="text-gold-dark text-[11px] font-semibold tracking-[0.2em] uppercase mb-3">
            Real Experiences
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-dark">
            Stories from our gifters
          </h2>
          <p className="text-warm-gray text-sm md:text-base mt-2 max-w-md mx-auto">
            See what verified customers are saying about our premium handcrafted gifts.
          </p>
        </Reveal>

        <div className="relative group/carousel">
          <div className="overflow-hidden w-full px-1" ref={emblaRef}>
            <div className="flex -ml-4 md:-ml-6">
              {reviews.map((r) => {
                const user = r.user;
                const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "GW";

                return (
                  <div
                    key={r.id}
                    className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4 md:pl-6 min-w-0"
                  >
                    <div className="bg-white rounded-3xl p-8 h-full shadow-sm hover:shadow-md border border-border/40 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
                      <div>
                        {/* Rating & Verified Buyer Badge */}
                        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                          <StarRating rating={r.rating} size="sm" />

                        </div>

                        {/* Quote Text */}
                        <blockquote className="font-display italic text-dark text-base leading-relaxed mb-4 flex-grow">
                          &ldquo;{r.comment}&rdquo;
                        </blockquote>
                      </div>

                      <div className="mt-6">
                        {/* Reviewed Product Link */}
                        {r.product && (
                          <div className="mb-4">
                            <Link
                              href={`/products/${r.product.slug}`}
                              className="inline-block text-xs font-semibold text-gold-dark hover:underline bg-gold/5 border border-gold/15 px-2.5 py-1 rounded-lg"
                            >
                              Gifter of: {r.product.name}
                            </Link>
                          </div>
                        )}

                        {/* Author info */}
                        <div className="border-t border-border/60 pt-4 flex items-center gap-3">
                          <Avatar className="w-10 h-10 border border-gold/20 flex-shrink-0">
                            <AvatarImage src={user?.avatar_url ?? undefined} alt={user?.name ?? "Customer"} />
                            <AvatarFallback className="bg-gold/10 text-gold-dark text-xs font-bold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-semibold text-dark text-sm leading-tight truncate">
                              {user?.name ?? "Verified Gifter"}
                            </p>
                            <p className="text-[11px] text-warm-gray leading-none mt-1">
                              {formatDate(r.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons (Only display if reviews.length > 1) */}
          {reviews.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                disabled={!prevBtnEnabled}
                className={cn(
                  "absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm border border-border shadow-md flex items-center justify-center text-dark transition-all duration-300 hidden md:flex",
                  prevBtnEnabled
                    ? "hover:bg-gold hover:text-dark hover:border-gold cursor-pointer opacity-80 group-hover/carousel:opacity-100"
                    : "opacity-40 cursor-not-allowed"
                )}
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                onClick={scrollNext}
                disabled={!nextBtnEnabled}
                className={cn(
                  "absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm border border-border shadow-md flex items-center justify-center text-dark transition-all duration-300 hidden md:flex",
                  nextBtnEnabled
                    ? "hover:bg-gold hover:text-dark hover:border-gold cursor-pointer opacity-80 group-hover/carousel:opacity-100"
                    : "opacity-40 cursor-not-allowed"
                )}
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Indicator Dots (Only display if reviews.length > 1) */}
        {reviews.length > 1 && scrollSnaps.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                  index === selectedIndex ? "w-6 bg-gold" : "w-1.5 bg-gold/30 hover:bg-gold/50"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
