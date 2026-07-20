"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ChevronDown, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { NAV_LINKS, SITE_NAME } from "@/constants/ui";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils/cn";
import { getCategoryHref, isCategoryLinkAvailable } from "./nav-utils";
import { MobileMenuAuth } from "./MobileMenuAuth";
import {
  mobileNavItemClass,
  mobileNavSubItemClass,
} from "./mobile-menu-styles";
import type { Category } from "@/types/product";

interface Props {
  categories: Category[];
}

export function MobileMenu({ categories }: Props) {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const closeAll = () => {
    setOpen(false);
    setCategoriesOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-secondary-dark"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="flex w-72 flex-col gap-0 overflow-hidden bg-cream p-0 sm:max-w-xs"
        >
          <div className="border-b border-border px-5 py-4 pr-14">
            <Link
              href={ROUTES.HOME}
              onClick={closeAll}
              className="flex items-center gap-2.5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-gold/20">
                <Gift className="h-4 w-4 text-dark" />
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-dark">
                {SITE_NAME}
              </span>
            </Link>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
            <nav className="flex flex-col gap-0.5">
              {NAV_LINKS.map((link) => {
                if ("dropdown" in link && link.dropdown) {
                  if (categories.length === 0) return null;
                  return (
                    <div key={link.label} className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => setCategoriesOpen(!categoriesOpen)}
                        className={cn(mobileNavItemClass, "justify-between")}
                      >
                        <span>{link.label}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 shrink-0 transition-transform duration-200",
                            categoriesOpen && "rotate-180"
                          )}
                        />
                      </button>
                      {categoriesOpen && (
                        <div className="ml-2 mt-0.5 flex flex-col gap-0.5 border-l-2 border-gold/20 pl-3">
                          {categories.map((category) => (
                            <Link
                              key={category.id}
                              href={getCategoryHref(category.slug)}
                              onClick={closeAll}
                              className={mobileNavSubItemClass}
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
                    onClick={closeAll}
                    className={mobileNavItemClass}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <MobileMenuAuth onNavigate={closeAll} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
