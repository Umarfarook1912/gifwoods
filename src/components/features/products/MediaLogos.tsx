import { Reveal } from "@/components/shared/Reveal";
import { MEDIA_LOGOS } from "@/constants/ui";

export function MediaLogos() {
  const doubled = [...MEDIA_LOGOS, ...MEDIA_LOGOS];

  return (
    <section className="bg-white py-8 overflow-hidden border-b border-border">
      <Reveal>
        <p className="text-center text-[11px] font-semibold tracking-[0.2em] uppercase text-warm-gray mb-6">
          Trusted by 25,000+ gifters
        </p>
      </Reveal>
      <div className="relative">
        <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap">
          {doubled.map((logo, i) => (
            <span
              key={i}
              className="inline-block font-display text-xl md:text-2xl uppercase tracking-[0.12em] text-secondary-dark/40 mx-10"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
