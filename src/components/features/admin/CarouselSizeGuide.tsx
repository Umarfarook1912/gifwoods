import { HOMEPAGE_CAROUSEL_COPY } from "@/constants/homepage-carousel";

interface Props {
  leftCount: number;
  rightCount: number;
}

export function CarouselSizeGuide({ leftCount, rightCount }: Props) {
  return (
    <div className="mb-6 rounded-xl border border-gold/30 bg-cream/50 p-4">
      <p className="mb-2 text-sm font-semibold text-dark">
        {HOMEPAGE_CAROUSEL_COPY.SIZE_GUIDE_TITLE}
      </p>
      <ul className="space-y-1 text-sm text-warm-gray">
        <li>{HOMEPAGE_CAROUSEL_COPY.SIZE_GUIDE_LEFT}</li>
        <li>{HOMEPAGE_CAROUSEL_COPY.SIZE_GUIDE_RIGHT}</li>
        <li>{HOMEPAGE_CAROUSEL_COPY.SIZE_GUIDE_NOTE}</li>
      </ul>
      <p className="mt-3 text-xs text-warm-gray">
        Left slides: {leftCount} · Right slides: {rightCount}
      </p>
    </div>
  );
}
