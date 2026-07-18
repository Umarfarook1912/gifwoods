import { Gem, PenTool, ShieldCheck, Gift, Package, Headphones } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { WHY_US_ITEMS } from "@/constants/ui";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  gem: Gem,
  "pen-tool": PenTool,
  "shield-check": ShieldCheck,
  gift: Gift,
  package: Package,
  headphones: Headphones,
};

export function WhyUsSection() {
  return (
    <section className="py-16 bg-cream">
      <div className="page-container">
        <Reveal className="text-center mb-12">
          <p className="text-gold-dark text-[11px] font-semibold tracking-[0.2em] uppercase mb-3">
            Why Gifwoods
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-dark max-w-xl mx-auto">
            The details that make it feel like a gift.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHY_US_ITEMS.map((item, index) => {
            const Icon = ICON_MAP[item.icon];
            return (
              <Reveal key={item.title} delay={(index % 3) as 0 | 1 | 2}>
                <div className="bg-white rounded-3xl p-7 h-full hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="w-11 h-11 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-5">
                    <Icon className="h-5 w-5 text-gold-dark" />
                  </div>
                  <h3 className="font-display font-semibold text-dark text-lg mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-warm-gray leading-relaxed">{item.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
