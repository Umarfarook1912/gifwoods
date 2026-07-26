import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Truck, Star } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { ASSETS } from "@/constants/assets";

const HERO_STATS = [
  { value: "25K+", label: "Gifts delivered" },
  { value: "4.9", label: "4,200+ reviews", star: true },
  { value: "500+", label: "Custom designs" },
] as const;

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cream via-cream to-gold/20">
      <div className="page-container py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left copy */}
          <div>
            <span className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-white border border-gold/30 px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-secondary-dark">
                A luxury gifting atelier
              </span>
            </span>

            <h1 className="animate-fade-up anim-delay-100 font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-dark leading-[1.08] mb-6">
              Make every gift{" "}
              <em className="text-gold not-italic font-display italic">memorable.</em>
            </h1>

            <p className="animate-fade-up anim-delay-200 text-warm-gray text-lg max-w-md mb-8 leading-relaxed">
              Premium personalized gifts crafted to celebrate every special
              moment — engraved, hand-packed, and delivered with intention.
            </p>

            <div className="animate-fade-up anim-delay-300 flex flex-wrap gap-3 mb-10">
              <Link
                href={ROUTES.SHOP}
                className="inline-flex items-center gap-2 bg-gold text-dark font-semibold px-7 py-3.5 rounded-full hover:bg-gold-dark transition-colors"
              >
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={ROUTES.SHOP + "?view=categories"}
                className="inline-flex items-center bg-white text-dark font-semibold px-7 py-3.5 rounded-full border border-border hover:border-gold transition-colors"
              >
                Explore Collections
              </Link>
            </div>

            {/* Stats row */}
            <div className="animate-fade-up anim-delay-400 flex items-center gap-6 sm:gap-8">
              {HERO_STATS.map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-6 sm:gap-8">
                  {i > 0 && <span className="h-8 w-px bg-border" />}
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-display font-bold text-2xl text-dark">
                        {stat.value}
                      </span>
                      {"star" in stat && stat.star && (
                        <Star className="h-4 w-4 fill-gold text-gold" />
                      )}
                    </div>
                    <p className="text-[10px] font-semibold tracking-wider uppercase text-warm-gray mt-0.5">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right image with floating cards */}
          <div className="relative animate-scale-in anim-delay-200">
            <div className="relative aspect-[4/5] max-h-[560px] w-full rounded-3xl overflow-hidden">
              <Image
                src={ASSETS.HERO_IMAGE}
                alt="Signature Gifwoods gift box with satin ribbon"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Floating card: personalize */}
            <div className="animate-float absolute top-8 -left-4 lg:-left-8 bg-white/80 backdrop-blur-md rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-gold-dark" />
              </span>
              <div>
                <p className="text-[10px] font-semibold tracking-wider uppercase text-warm-gray">
                  Personalize
                </p>
                <p className="text-sm font-semibold text-dark">Names &amp; Photos</p>
              </div>
            </div>

            {/* Floating card: delivery */}
            <div className="animate-float-slow absolute bottom-8 -right-2 lg:right-6 bg-dark/90 backdrop-blur-md rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center">
                <Truck className="h-4 w-4 text-gold" />
              </span>
              <div>
                <p className="text-[10px] font-semibold tracking-wider uppercase text-white/60">
                  Delivery
                </p>
                <p className="text-sm font-semibold text-white">Insured across India</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
