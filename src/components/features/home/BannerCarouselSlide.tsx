import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  HOMEPAGE_CAROUSEL_OVERLAY_DEFAULTS,
} from "@/constants/homepage-carousel";
import { SITE_NAME } from "@/constants/ui";
import { cn } from "@/lib/utils/cn";
import type {
  HomepageCarouselSlide,
  HomepageCarouselSlot,
} from "@/types/homepage-carousel";

interface Props {
  slide: HomepageCarouselSlide;
  slot: HomepageCarouselSlot;
  compact?: boolean;
}

function isExternalLink(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function BannerCarouselSlide({ slide, slot, compact = false }: Props) {
  const defaults = HOMEPAGE_CAROUSEL_OVERLAY_DEFAULTS[slot];
  const headline = slide.headline?.trim() || defaults.headline;
  const subheadline = slide.subheadline?.trim() || defaults.subheadline;
  const cta = slide.cta_label?.trim() || defaults.cta;

  const content = (
    <>
      <Image
        src={slide.image_url}
        alt={slide.alt_text || headline}
        fill
        className="object-cover transition-transform duration-700 group-hover/slide:scale-[1.03]"
        sizes={compact ? "(max-width: 1024px) 100vw, 25vw" : "(max-width: 1024px) 100vw, 75vw"}
        unoptimized
        priority
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/25 to-dark/5"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-dark/50 via-transparent to-transparent"
        aria-hidden
      />
      <div className="absolute left-0 top-0 h-full w-1 bg-gold" aria-hidden />

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-[1] flex flex-col items-start",
          compact ? "gap-1.5 p-3 sm:p-4" : "gap-2 p-4 sm:gap-3 sm:p-6 lg:p-8"
        )}
      >
        <span
          className={cn(
            "inline-flex items-center rounded-full border border-white/25 bg-white/10 font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm",
            compact ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[10px]"
          )}
        >
          {SITE_NAME}
        </span>
        <h2
          className={cn(
            "max-w-xl font-display font-bold leading-tight text-white drop-shadow-sm",
            compact ? "text-base sm:text-lg" : "text-xl sm:text-2xl lg:text-4xl"
          )}
        >
          {headline}
        </h2>
        {!compact && (
          <p className="max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
            {subheadline}
          </p>
        )}
        {compact && (
          <p className="line-clamp-2 text-xs leading-snug text-white/80">{subheadline}</p>
        )}
        <span
          className={cn(
            "mt-1 inline-flex items-center gap-1.5 bg-gold font-semibold text-dark transition-colors group-hover/slide:bg-gold-dark",
            compact
              ? "rounded-full px-3 py-1.5 text-xs"
              : "rounded-full px-4 py-2 text-sm sm:px-5 sm:py-2.5"
          )}
        >
          {cta}
          <ArrowRight className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
        </span>
      </div>
    </>
  );

  const className =
    "group/slide relative block h-full w-full flex-[0_0_100%] overflow-hidden";

  if (isExternalLink(slide.link_url)) {
    return (
      <a
        href={slide.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={slide.link_url} className={className}>
      {content}
    </Link>
  );
}
