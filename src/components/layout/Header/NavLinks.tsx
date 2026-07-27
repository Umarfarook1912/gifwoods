"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { NAV_LINKS } from "@/constants/ui";
import { CategoriesMegaMenu } from "./CategoriesMegaMenu";
import {
  isCategoryLinkAvailable,
  isNavLinkActive,
} from "./nav-utils";
import type { Category } from "@/types/product";

interface Props {
  categories: Category[];
}

export function NavLinks({ categories }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="hidden md:flex items-center gap-5 lg:gap-6">
      {NAV_LINKS.map((link) => {
        if ("dropdown" in link && link.dropdown) {
          if (categories.length === 0) return null;
          const isCategoryRoute = pathname.startsWith("/categories/");
          return (
            <div
              key={link.label}
              className="relative py-2"
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
            >
              <button
                type="button"
                className={cn(
                  "flex items-center gap-1 text-sm font-medium transition-colors hover:text-gold cursor-pointer outline-none",
                  isOpen || isCategoryRoute ? "text-gold" : "text-secondary-dark"
                )}
              >
                {link.label}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </button>

              {isOpen && (
                <div className="absolute top-full left-1/2 z-50 mt-1 -translate-x-1/2 animate-fade-in">
                  <CategoriesMegaMenu
                    categories={categories}
                    onNavigate={() => setIsOpen(false)}
                  />
                </div>
              )}
            </div>
          );
        }

        if (!isCategoryLinkAvailable(link.href, categories)) return null;

        const active = isNavLinkActive(link.href, pathname, search);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-gold",
              active ? "text-gold" : "text-secondary-dark"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
