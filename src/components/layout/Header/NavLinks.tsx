"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { NAV_LINKS } from "@/constants/ui";
import { ROUTES } from "@/constants/routes";
import { getCategoryHref, isCategoryLinkAvailable } from "./nav-utils";
import type { Category } from "@/types/product";

interface Props {
  categories: Category[];
}

export function NavLinks({ categories }: Props) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="hidden md:flex items-center gap-7">
      {NAV_LINKS.map((link) => {
        if ("dropdown" in link && link.dropdown) {
          if (categories.length === 0) return null;
          return (
            <div
              key={link.label}
              className="relative py-2"
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
            >
              <button
                className={cn(
                  "flex items-center gap-1 text-sm font-medium transition-colors hover:text-gold cursor-pointer outline-none",
                  isOpen ? "text-gold" : "text-secondary-dark"
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

              {/* Dropdown Menu */}
              {isOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-48 rounded-2xl bg-cream border border-border shadow-lg py-2.5 z-50 animate-fade-in">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={getCategoryHref(category.slug)}
                      className="block px-4 py-2 text-sm font-medium text-secondary-dark hover:bg-gold/15 hover:text-gold transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        }

        if (!isCategoryLinkAvailable(link.href, categories)) return null;

        return (
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
        );
      })}
    </nav>
  );
}
