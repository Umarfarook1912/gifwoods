import type { PolicySection } from "@/types/support";

interface PolicySectionsProps {
  sections: PolicySection[];
}

export function PolicySections({ sections }: PolicySectionsProps) {
  return (
    <div className="space-y-4 md:space-y-5">
      {sections.map((section, index) => {
        const number = String(index + 1).padStart(2, "0");
        return (
          <section
            key={section.title}
            id={`section-${index + 1}`}
            className="group relative overflow-hidden rounded-3xl border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md md:p-7"
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gold via-gold-light to-gold/40 opacity-80" />

            <div className="flex gap-4 md:gap-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold/15 font-display text-sm font-bold text-gold-dark md:h-12 md:w-12 md:text-base">
                {number}
              </span>

              <div className="min-w-0 flex-1 pt-0.5">
                <h2 className="font-display text-lg font-bold text-dark md:text-xl">
                  {section.title}
                </h2>

                {section.paragraphs?.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 40)}
                    className="mt-3 text-[15px] leading-7 text-warm-gray md:text-base md:leading-8"
                  >
                    {paragraph}
                  </p>
                ))}

                {section.bullets && section.bullets.length > 0 && (
                  <ul className="mt-4 space-y-2.5">
                    {section.bullets.map((item) => (
                      <li key={item} className="flex gap-3 text-[15px] leading-7 text-warm-gray md:text-base">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.numbered && section.numbered.length > 0 && (
                  <ol className="mt-4 space-y-3">
                    {section.numbered.map((item, stepIndex) => (
                      <li
                        key={item}
                        className="flex gap-3 text-[15px] leading-7 text-warm-gray md:text-base"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-dark text-xs font-semibold text-white">
                          {stepIndex + 1}
                        </span>
                        <span className="pt-0.5">{item}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
