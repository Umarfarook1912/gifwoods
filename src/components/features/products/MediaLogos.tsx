import { MEDIA_LOGOS } from "@/constants/ui";

export function MediaLogos() {
  const doubled = [...MEDIA_LOGOS, ...MEDIA_LOGOS];

  return (
    <section className="bg-cream py-6 overflow-hidden border-b border-border">
      <p className="text-center text-xs font-semibold tracking-[0.2em] uppercase text-warm-gray mb-5">
        Trusted by 25,000+ gifters
      </p>
      <div className="relative">
        <div className="flex animate-[marquee_25s_linear_infinite] whitespace-nowrap">
          {doubled.map((logo, i) => (
            <span
              key={i}
              className="inline-block text-sm font-semibold text-secondary-dark/50 mx-8 tracking-wider"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
