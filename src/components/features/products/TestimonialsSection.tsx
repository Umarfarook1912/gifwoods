import { Star } from "lucide-react";

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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-gold text-sm font-semibold tracking-wider uppercase mb-2">
            Kind words
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-dark">
            Stories from our gifters
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-cream rounded-2xl p-8 border border-border relative"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }, (_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <blockquote className="text-secondary-dark text-sm leading-relaxed mb-6 italic">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold text-dark flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-dark text-sm">{t.name}</p>
                  <p className="text-xs text-warm-gray">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
