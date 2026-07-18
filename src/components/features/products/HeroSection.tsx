import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-secondary-dark">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1600')`,
        }}
        role="img"
        aria-label="Signature Gifwoods gift box"
      />
      <div className="absolute inset-0 bg-dark-gradient" />
      <div className="absolute inset-0 bg-dark/50" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <p className="text-gold text-sm font-semibold tracking-[0.2em] uppercase mb-4">
          A luxury gifting atelier
        </p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 text-balance leading-tight">
          Make every gift memorable.
        </h1>
        <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 text-balance">
          Premium personalized gifts crafted to celebrate every special moment —
          engraved, hand-packed, and delivered with intention.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-gold text-dark hover:bg-gold-dark font-semibold text-base px-8"
            asChild
          >
            <Link href={ROUTES.SHOP}>Shop Now</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/40 text-white hover:bg-white/10 hover:text-white font-semibold text-base px-8"
            asChild
          >
            <Link href={ROUTES.SHOP + "?view=categories"}>Explore Collections</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
