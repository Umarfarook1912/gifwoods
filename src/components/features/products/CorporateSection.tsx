import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Clock, Sparkles } from "lucide-react";

const CORPORATE_STATS = [
  { icon: Users, value: "25+", label: "Min order" },
  { icon: Clock, value: "48h", label: "Sample turnaround" },
  { icon: Sparkles, value: "Free", label: "Design consult" },
] as const;

export function CorporateSection() {
  return (
    <section className="py-16 bg-secondary-dark">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-gold text-sm font-semibold tracking-wider uppercase mb-3">
              Corporate gifting
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Gifts that say thank you — at scale.
            </h2>
            <p className="text-white/70 text-lg mb-8 leading-relaxed">
              Bulk-priced curated hampers, branded engraving and dedicated concierge
              for teams of 25 to 25,000.
            </p>
            <div className="flex gap-4 mb-8">
              <Button className="bg-gold text-dark hover:bg-gold-dark font-semibold" asChild>
                <Link href="/contact?type=corporate">Request Quote</Link>
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/shop?category=corporate">Download Lookbook</Link>
              </Button>
            </div>
            <div className="flex gap-8">
              {CORPORATE_STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="h-4 w-4 text-gold" />
                    <span className="font-display font-bold text-2xl text-white">{value}</span>
                  </div>
                  <span className="text-xs text-white/60">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden aspect-[4/3]">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800')`,
              }}
              role="img"
              aria-label="Corporate gift hampers"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
