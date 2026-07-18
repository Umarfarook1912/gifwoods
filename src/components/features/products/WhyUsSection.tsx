import { Gem, PenTool, ShieldCheck, Gift, Package, Headphones } from "lucide-react";
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
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-gold text-sm font-semibold tracking-wider uppercase mb-2">
            Why Gifwoods
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-dark">
            The details that make it feel like a gift.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_US_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon];
            return (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 border border-border hover:border-gold/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-display font-semibold text-dark mb-2">{item.title}</h3>
                <p className="text-sm text-warm-gray leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
