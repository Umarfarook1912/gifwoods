"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Headphones, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { ROUTES } from "@/constants/routes";
import {
  SUPPORT_CONTACT_CTA_DESCRIPTION,
  SUPPORT_CONTACT_CTA_LABEL,
  SUPPORT_CONTACT_CTA_TITLE,
  SUPPORT_LAST_UPDATED_PREFIX,
  SUPPORT_NAV_LINKS,
  SUPPORT_PAGE_EYEBROW,
} from "@/constants/ui";
import { cn } from "@/lib/utils/cn";

interface SupportPageLayoutProps {
  title: string;
  description?: string;
  lastUpdated?: string;
  children: ReactNode;
}

export function SupportPageLayout({
  title,
  description,
  lastUpdated,
  children,
}: SupportPageLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-cream">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-cream via-white to-gold/20" />
        <div className="pointer-events-none absolute -right-10 top-0 h-64 w-64 rounded-full bg-gold/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-48 w-48 rounded-full bg-gold/15 blur-3xl" />

        <div className="page-container relative py-12 md:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-dark backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5" />
            {SUPPORT_PAGE_EYEBROW}
          </div>

          <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold tracking-tight text-dark md:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-warm-gray md:text-lg md:leading-8">
              {description}
            </p>
          )}
          {lastUpdated && (
            <p className="mt-5 inline-flex rounded-full border border-border bg-white/90 px-3.5 py-1.5 text-xs font-medium text-warm-gray">
              {SUPPORT_LAST_UPDATED_PREFIX}: {lastUpdated}
            </p>
          )}

          <nav
            aria-label="Support pages"
            className="mt-8 flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
          >
            {SUPPORT_NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                    active
                      ? "border-dark bg-dark text-white shadow-sm"
                      : "border-border bg-white/90 text-secondary-dark hover:border-gold/50 hover:bg-gold/10"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <div className="page-container py-10 md:py-14">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>{children}</div>

          <aside className="h-fit overflow-hidden rounded-[1.75rem] border border-border bg-dark p-6 text-white shadow-lg lg:sticky lg:top-24">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/20 text-gold">
              <Headphones className="h-5 w-5" />
            </div>
            <h2 className="font-display text-xl font-bold">
              {SUPPORT_CONTACT_CTA_TITLE}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              {SUPPORT_CONTACT_CTA_DESCRIPTION}
            </p>
            <Link
              href={ROUTES.CONTACT}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-dark transition-colors hover:bg-gold-light"
            >
              {SUPPORT_CONTACT_CTA_LABEL}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
