import Link from "next/link";
import { Suspense } from "react";
import { Search, User } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { BrandLogo } from "@/components/shared/BrandLogo";
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
            <Link href={ROUTES.HOME} className="flex items-center" aria-label="Home">
              <BrandLogo priority />
            </Link>
          </div>

          <Suspense fallback={<nav className="hidden md:block h-5 w-96" aria-hidden />}>
            <NavLinks categories={categories} />
          </Suspense>

          <div className="flex items-center gap-1">
            <Link
              href={ROUTES.SHOP}
              aria-label="Search gifts"
              className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-dark hover:bg-gold/10 transition-colors"
            >
              <Search className="h-[18px] w-[18px]" />
            </Link>
            <AuthMenu icon={<User className="h-[18px] w-[18px]" />} />
            <CartButton />
          </div>
        </div>
      </div>
    </header>
  );
}
