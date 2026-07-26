import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { ROUTES } from "@/constants/routes";
import { ASSETS } from "@/constants/assets";

const PERSONALIZE_OPTIONS = [
  "Name Engraving",
  "Photo Gifts",
  "Wooden Name Boards",
  "Corporate Branding",
] as const;

export function PersonalizeSection() {
  return (
    <section className="py-8 bg-cream">
      <div className="page-container">
        <Reveal>
        <div className="rounded-[2rem] bg-gradient-to-br from-secondary-dark to-dark p-8 md:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <p className="text-gold text-[11px] font-semibold tracking-[0.2em] uppercase mb-4">
                Personalize
              </p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5">
                Made just{" "}
                <em className="text-gold font-display italic">for them.</em>
              </h2>
              <p className="text-white/60 text-base md:text-lg mb-8 leading-relaxed max-w-md">
                Engrave a name, embed a photo, choose the font, add a
                handwritten note — we craft it in-house so every detail feels
                intentional.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-9 max-w-md">
                {PERSONALIZE_OPTIONS.map((label) => (
                  <div
                    key={label}
                    className="px-4 py-2.5 rounded-full border border-white/15 text-white/80 text-sm text-center"
                  >
                    {label}
                  </div>
                ))}
              </div>

              <Link
                href={ROUTES.CATEGORY("personalized")}
                className="inline-flex items-center gap-2 bg-gold text-dark font-semibold px-7 py-3.5 rounded-full hover:bg-gold-dark transition-colors"
              >
                Customize Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
              <Image
                src={ASSETS.PERSONALIZE_IMAGE}
                alt="Personalized leather journal"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  );
}
