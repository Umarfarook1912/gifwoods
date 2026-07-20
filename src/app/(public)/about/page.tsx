import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE_NAME, SITE_TAGLINE } from "@/constants/ui";
import { ROUTES } from "@/constants/routes";
import { MapPin, Navigation } from "lucide-react";

export const metadata: Metadata = {
  title: "About Gifwoods — Gift Manufacturer & Custom Gifting Atelier",
  description:
    "Learn the story behind Gifwoods — premier gift manufacturer, wholesaler, corporate, customized and function gifts based in Thanjavur, Tamil Nadu.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="relative bg-secondary-dark py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=1600')`,
          }}
        />
        <div className="relative page-container text-center max-w-3xl animate-fade-up">
          <p className="text-gold text-sm font-semibold tracking-[0.2em] uppercase mb-4">
            Our Story & Atelier
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            {SITE_NAME}
          </h1>
          <p className="text-white/80 text-lg md:text-xl font-medium">
            Gift Manufacturer & Wholesaler • Corporate, Customized & Function Gifts
          </p>
        </div>
      </div>

      <div className="page-container py-16 max-w-4xl space-y-10">
        {/* Story Card */}
        <div className="animate-fade-up anim-delay-100 bg-white rounded-3xl p-8 md:p-12 border border-border shadow-xs space-y-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-dark mb-4">
              How It Started
            </h2>
            <p className="text-warm-gray leading-relaxed text-base">
              Gifwoods was born from a vision to craft meaningful, high-quality personalized tokens that tell unforgettable stories. Based in Thanjavur, Tamil Nadu, we operate as a full-fledged gift manufacturer and wholesaler supplying custom corporate gifts, personalized function favors, and bespoke hampers across India.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-dark mb-4">
              What We Specialize In
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {[
                {
                  title: "Gift Manufacturing & Wholesale",
                  desc: "Direct-from-atelier manufacturing with competitive bulk & wholesale pricing.",
                },
                {
                  title: "Corporate Gifting",
                  desc: "Custom branded merchandise, employee appreciation kits, and executive hampers.",
                },
                {
                  title: "Customized Gifts",
                  desc: "Laser engraving, photo embedding, and bespoke personalizations.",
                },
                {
                  title: "Function & Event Gifts",
                  desc: "Memorable return gifts for weddings, anniversaries, housewarmings, and milestones.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-5 rounded-2xl bg-cream/50 border border-border/80"
                >
                  <h3 className="font-semibold text-dark text-base mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-warm-gray leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-dark mb-4">
              By The Numbers
            </h2>
            <div className="grid grid-cols-3 gap-6 py-6 border-y border-border/60">
              {[
                { value: "25,000+", label: "Gifts Delivered" },
                { value: "500+", label: "Custom Designs" },
                { value: "4.9 ★", label: "Average Rating" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-display font-bold text-2xl md:text-3xl text-dark">
                    {stat.value}
                  </p>
                  <p className="text-xs text-warm-gray mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Address & Google Maps Location */}
        <div className="animate-fade-up anim-delay-200 bg-white rounded-3xl p-8 md:p-10 border border-border shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-gold-dark text-xs font-semibold uppercase tracking-wider mb-2">
                <MapPin className="h-3.5 w-3.5" /> Manufacturing Atelier & Office
              </div>
              <h2 className="font-display text-2xl font-bold text-dark">
                Company Address & Location
              </h2>
              <p className="text-warm-gray text-sm mt-1">
                Gifwoods - Gift Manufacturer, Gift Wholesaler, Corporate Gifts, Customized Gifts, Function Gifts
              </p>
            </div>
            <a
              href="https://maps.google.com/?q=G1A,+VOC+Nagar,+Parisutham+Nagar,+Thanjavur,+Tamil+Nadu+613007"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dark text-white text-xs font-semibold hover:bg-gold hover:text-dark transition-all self-start md:self-auto shrink-0"
            >
              <Navigation className="h-4 w-4" /> Get Directions
            </a>
          </div>

          {/* Full Address Card */}
          <div className="p-5 rounded-2xl bg-cream/70 border border-border space-y-1">
            <p className="font-bold text-dark text-base">
              Gifwoods — Headquarters & Manufacturing Facility
            </p>
            <p className="text-sm text-dark font-medium leading-relaxed">
              G1A, VOC Nagar, Parisutham Nagar, Thanjavur, Tamil Nadu 613007
            </p>
          </div>

          {/* Interactive Google Map Embed */}
          <div className="rounded-2xl overflow-hidden border border-border h-80 w-full relative bg-muted shadow-inner">
            <iframe
              title="Gifwoods Office & Manufacturing Unit Map Location"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src="https://maps.google.com/maps?q=G1A,+VOC+Nagar,+Parisutham+Nagar,+Thanjavur,+Tamil+Nadu+613007&t=&z=16&ie=UTF8&iwloc=&output=embed"
            />
          </div>
        </div>

        {/* Collection Callout */}
        <div className="text-center pt-4">
          <Button
            className="bg-gold text-dark hover:bg-gold-dark font-semibold px-8 py-6 rounded-2xl text-base shadow-sm"
            asChild
          >
            <Link href={ROUTES.SHOP}>Explore Our Collection</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
