"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { NAV_LINKS, OCCASIONS, SITE_NAME } from "@/constants/ui";
import { cn } from "@/lib/utils/cn";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [occasionsOpen, setOccasionsOpen] = useState(false);

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
        <SheetContent side="left" className="w-72 bg-cream">
          <div className="flex items-center justify-between mb-8">
            <span className="font-display font-bold text-xl text-dark">{SITE_NAME}</span>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex flex-col gap-1.5">
            {NAV_LINKS.map((link) => {
              if ("dropdown" in link && link.dropdown) {
                return (
                  <div key={link.label} className="flex flex-col">
                    <button
                      onClick={() => setOccasionsOpen(!occasionsOpen)}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg text-sm font-medium text-secondary-dark flex items-center justify-between",
                        "hover:bg-gold/10 hover:text-gold transition-colors text-left cursor-pointer"
                      )}
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          occasionsOpen && "rotate-180"
                        )}
                      />
                    </button>
                    {occasionsOpen && (
                      <div className="pl-4 flex flex-col gap-1 mt-1 border-l border-gold/20 ml-6">
                        {OCCASIONS.map((occ) => (
                          <Link
                            key={occ.href}
                            href={occ.href}
                            onClick={() => {
                              setOpen(false);
                              setOccasionsOpen(false);
                            }}
                            className={cn(
                              "px-4 py-2.5 rounded-lg text-sm font-medium text-secondary-dark/85",
                              "hover:bg-gold/10 hover:text-gold transition-colors"
                            )}
                          >
                            {occ.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium text-secondary-dark",
                    "hover:bg-gold/10 hover:text-gold transition-colors"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
