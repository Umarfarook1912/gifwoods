import type { ReactNode } from "react";

interface Props {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
}

export function PolicyPage({ title, lastUpdated, children }: Props) {
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-secondary-dark py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white">{title}</h1>
          {lastUpdated && (
            <p className="text-white/50 text-sm mt-2">Last updated: {lastUpdated}</p>
          )}
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-white rounded-2xl p-8 border border-border prose prose-stone max-w-none
          prose-headings:font-display prose-headings:text-dark prose-h2:text-xl prose-h3:text-base
          prose-p:text-warm-gray prose-p:leading-relaxed prose-li:text-warm-gray prose-a:text-gold
          prose-strong:text-dark">
          {children}
        </div>
      </div>
    </div>
  );
}
