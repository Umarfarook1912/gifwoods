import { Star } from "lucide-react";

const STATS: { value: string; label: string; icon?: string }[] = [
  { value: "25K+", label: "Gifts delivered" },
  { value: "4.9", label: "4,200+ reviews", icon: "star" },
  { value: "500+", label: "Custom designs" },
];

export function StatsBar() {
  return (
    <section className="bg-white border-b border-border py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <div className="flex items-center gap-1">
                <span className="font-display font-bold text-3xl text-dark">
                  {stat.value}
                </span>
                {stat.icon === "star" && (
                  <Star className="h-5 w-5 fill-gold text-gold mt-0.5" />
                )}
              </div>
              <span className="text-sm text-warm-gray mt-0.5">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
