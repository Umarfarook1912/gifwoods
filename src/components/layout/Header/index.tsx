import Link from "next/link";
import { Gift, Search, User } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { SITE_NAME } from "@/constants/ui";
import { getAvailableCategories } from "@/lib/supabase/categories-db";
import { NavLinks } from "./NavLinks";
import { CartButton } from "./CartButton";
import { AuthMenu } from "./AuthMenu";
import { MobileMenu } from "./MobileMenu";

export async function Header() {
  const categories = await getAvailableCategories();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-cream/95 backdrop-blur-sm border-b border-border">
        <div className="page-container h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MobileMenu categories={categories} />
            <Link href={ROUTES.HOME} className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                <Gift className="h-4 w-4 text-dark" />
              </span>
              <span className="font-display font-bold text-xl text-dark tracking-tight">
                {SITE_NAME}
              </span>
            </Link>
          </div>

          <NavLinks categories={categories} />

          <div className="flex items-center gap-1">
            <Link
              href={ROUTES.SHOP}
              aria-label="Search gifts"
              className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-dark hover:bg-gold/10 transition-colors"
            >
              <Search className="h-[18px] w-[18px]" />
            </Link>
            <span className="hidden sm:flex">
              <AuthMenu icon={<User className="h-[18px] w-[18px]" />} />
            </span>
            <CartButton />
          </div>
        </div>
      </div>
    </header>
  );
}
