import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { SITE_NAME } from "@/constants/ui";
import { AnnouncementBar } from "./AnnouncementBar";
import { NavLinks } from "./NavLinks";
import { CartButton } from "./CartButton";
import { AuthMenu } from "./AuthMenu";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <AnnouncementBar />
      <div className="bg-cream/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <MobileMenu />
            <Link href={ROUTES.HOME} className="flex items-center">
              <span className="font-display font-bold text-xl text-dark tracking-tight">
                {SITE_NAME}
              </span>
            </Link>
          </div>

          <NavLinks />

          <div className="flex items-center gap-2">
            <CartButton />
            <AuthMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
