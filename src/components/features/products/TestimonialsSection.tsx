import { Star } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";

const TESTIMONIALS = [
  {
    quote:
      "The wedding hamper was breathtaking. Guests kept asking where we sourced it — it felt like a keepsake, not a gift.",
    name: "Ananya Iyer",
    role: "Bride, Bengaluru",
    initials: "AI",
    rating: 5,
  },
  {
    quote:
      "We ordered 200 corporate hampers. Delivery was flawless and the engraving quality is a step above anything we've seen.",
    name: "Rohan Mehta",
    role: "Founder, Kite HR",
    initials: "RM",
    rating: 5,
  },
  {
    quote:
      "The engraved frame made my husband cry. Truly a Gifwoods moment — I'm a customer for life.",
    name: "Priya Sharma",
    role: "Anniversary gift",
    initials: "PS",
    rating: 5,
  },
] as const;

export function TestimonialsSection() {
  return (
    <section className="py-16 lg:py-20 bg-cream">
      <div className="page-container">
        <Reveal className="text-center mb-12">
          <p className="text-gold-dark text-[11px] font-semibold tracking-[0.2em] uppercase mb-3">
            Kind words
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-dark">
            Stories from our gifters
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, index) => (
            <Reveal key={t.name} delay={(index % 3) as 0 | 1 | 2}>
            <div className="bg-white rounded-3xl p-8 h-full shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: t.rating }, (_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <blockquote className="font-display text-dark text-base leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="border-t border-border pt-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/40 text-gold-dark flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {t.initials.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-dark text-sm">{t.name}</p>
                  <p className="text-xs text-warm-gray">{t.role}</p>
                </div>
              </div>
            </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
