"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { NAV_LINKS } from "@/constants/ui";

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-6">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-gold",
            pathname === link.href ? "text-gold" : "text-secondary-dark"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
