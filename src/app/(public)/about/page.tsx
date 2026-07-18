import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE_NAME, SITE_TAGLINE } from "@/constants/ui";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "About Gifwoods",
  description: "Learn the story behind Gifwoods — a luxury gifting atelier crafting personalized gifts with intention.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="relative bg-secondary-dark py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=1600')` }}
        />
        <div className="relative page-container text-center max-w-3xl animate-fade-up">
          <p className="text-gold text-sm font-semibold tracking-[0.2em] uppercase mb-4">Our Story</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">{SITE_NAME}</h1>
          <p className="text-white/70 text-xl">{SITE_TAGLINE}</p>
        </div>
      </div>

      <div className="page-container py-16 max-w-3xl">
        <div className="animate-fade-up anim-delay-100 bg-white rounded-2xl p-8 md:p-12 border border-border space-y-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-dark mb-4">How it started</h2>
            <p className="text-warm-gray leading-relaxed">
              Gifwoods was born from a simple frustration — the best gifts should tell a story, but most gifts feel generic. In 2022, a small team of artisans and designers in Bengaluru set out to change that, building an atelier where every gift is handcrafted, personalized, and packed with intention.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-dark mb-4">What we believe</h2>
            <p className="text-warm-gray leading-relaxed">
              We believe that a gift is a moment — a chance to say &quot;I see you&quot; in a way that lasts. That&apos;s why we engrave names, embed photos, hand-pour candles, and tie every ribbon ourselves. No shortcuts. No outsourcing. Just craft.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-dark mb-4">By the numbers</h2>
            <div className="grid grid-cols-3 gap-6">
              {[
                { value: "25,000+", label: "Gifts delivered" },
                { value: "500+", label: "Custom designs" },
                { value: "4.9 ★", label: "Average rating" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-display font-bold text-2xl text-dark">{stat.value}</p>
                  <p className="text-xs text-warm-gray mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Button className="bg-gold text-dark hover:bg-gold-dark font-semibold" asChild>
              <Link href={ROUTES.SHOP}>Explore Our Collection</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
