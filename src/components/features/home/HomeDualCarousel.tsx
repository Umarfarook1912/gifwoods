import { BannerCarousel } from "@/components/features/home/BannerCarousel";
import {
  HOMEPAGE_CAROUSEL_COPY,
  HOMEPAGE_CAROUSEL_SLOTS,
} from "@/constants/homepage-carousel";
import type { HomepageCarouselSlide } from "@/types/homepage-carousel";

interface Props {
  slides: HomepageCarouselSlide[];
}

export function HomeDualCarousel({ slides }: Props) {
  const left = slides.filter((s) => s.slot === HOMEPAGE_CAROUSEL_SLOTS.LEFT);
  const right = slides.filter((s) => s.slot === HOMEPAGE_CAROUSEL_SLOTS.RIGHT);

  if (left.length === 0 && right.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-cream via-cream to-white pt-4 pb-3 sm:pt-5 sm:pb-4">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,_rgba(229,169,60,0.16),_transparent_60%)]"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-dark">
          {HOMEPAGE_CAROUSEL_COPY.SECTION_EYEBROW}
        </p>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-4">
          <div className="w-full lg:w-3/4">
            {left.length > 0 ? (
              <div className="aspect-[2.5/1] min-h-[180px] w-full sm:min-h-[220px]">
                <BannerCarousel
                  slides={left}
                  slot={HOMEPAGE_CAROUSEL_SLOTS.LEFT}
                  ariaLabel="Main promotional carousel"
                />
              </div>
            ) : null}
          </div>
          <div className="w-full lg:w-1/4">
            {right.length > 0 ? (
              <div className="aspect-[2.5/1] min-h-[180px] w-full sm:min-h-[220px] lg:aspect-auto lg:h-full lg:min-h-0">
                <BannerCarousel
                  slides={right}
                  slot={HOMEPAGE_CAROUSEL_SLOTS.RIGHT}
                  compact
                  ariaLabel="Secondary promotional carousel"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
