"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { SiteLoader } from "./SiteLoader";

export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;

      const target = event.target as HTMLElement | null;
      if (target?.closest("button, [role='button'], input, select, textarea")) return;

      const anchor = target?.closest("a");
      if (!anchor) return;

      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;

        const next = `${url.pathname}${url.search}`;
        const current = `${window.location.pathname}${window.location.search}`;
        if (next !== current) setLoading(true);
      } catch {
        // ignore invalid URLs
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!loading) return null;
  return <SiteLoader />;
}
