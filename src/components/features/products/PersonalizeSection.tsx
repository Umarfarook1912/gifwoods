import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pen, Image as ImageIcon, Type, Sparkles, ArrowRight } from "lucide-react";

const PERSONALIZE_OPTIONS = [
  { icon: Type, label: "Name Engraving" },
  { icon: ImageIcon, label: "Photo Gifts" },
  { icon: Pen, label: "Wooden Name Boards" },
  { icon: Sparkles, label: "Corporate Branding" },
] as const;

export function PersonalizeSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-gold text-sm font-semibold tracking-wider uppercase mb-3">
              Personalize
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-dark mb-4">
              Made just for them.
            </h2>
            <p className="text-warm-gray text-lg mb-8 leading-relaxed">
              Engrave a name, embed a photo, choose the font, add a handwritten note
              — we craft it in-house so every detail feels intentional.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {PERSONALIZE_OPTIONS.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gold/20 bg-gold/5"
                >
                  <Icon className="h-4 w-4 text-gold flex-shrink-0" />
                  <span className="text-sm font-medium text-dark">{label}</span>
                </div>
              ))}
            </div>
            <Button
              className="bg-gold text-dark hover:bg-gold-dark font-semibold"
              asChild
            >
              <Link href="/shop?category=personalized">
                Customize Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="relative">
            <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-muted">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1544816155-12df9643f363?w=800')`,
                }}
                role="img"
                aria-label="Personalized leather journal"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-gold rounded-xl p-4 shadow-lg max-w-[180px]">
              <p className="text-dark font-display font-semibold text-sm leading-snug">
                Crafted in-house, every detail intentional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
