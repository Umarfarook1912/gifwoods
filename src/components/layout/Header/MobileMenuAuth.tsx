"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  Package,
  MapPin,
  LogIn,
  UserPlus,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { AUTH_NAV_LABELS } from "@/constants/auth";
import { buildLoginHref, buildRegisterHref } from "@/lib/auth/callback-url";
import { cn } from "@/lib/utils/cn";
import {
  mobileNavItemClass,
  mobileNavSectionClass,
} from "./mobile-menu-styles";

interface MobileMenuAuthProps {
  onNavigate?: () => void;
}

export function MobileMenuAuth({ onNavigate }: MobileMenuAuthProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  if (status === "loading") {
    return <div className="mt-4 h-20 animate-pulse rounded-xl bg-muted/40" />;
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      {!session ? (
        <div className="flex flex-col gap-0.5">
          <Link
            href={buildLoginHref(returnPath)}
            onClick={onNavigate}
            className={mobileNavItemClass}
          >
            <LogIn className="h-4 w-4 shrink-0" />
            {AUTH_NAV_LABELS.LOGIN}
          </Link>
          <Link
            href={buildRegisterHref(returnPath)}
            onClick={onNavigate}
            className={mobileNavItemClass}
          >
            <UserPlus className="h-4 w-4 shrink-0" />
            {AUTH_NAV_LABELS.REGISTER}
          </Link>
        </div>
      ) : (
        <>
          <p className={mobileNavSectionClass}>Account</p>
          <div className="flex flex-col gap-0.5">
            <Link href={ROUTES.PROFILE} onClick={onNavigate} className={mobileNavItemClass}>
              <User className="h-4 w-4 shrink-0" />
              {AUTH_NAV_LABELS.PROFILE}
            </Link>
            <Link href={ROUTES.ORDERS} onClick={onNavigate} className={mobileNavItemClass}>
              <Package className="h-4 w-4 shrink-0" />
              {AUTH_NAV_LABELS.MY_ORDERS}
            </Link>
            <Link
              href={ROUTES.PROFILE_TAB("addresses")}
              onClick={onNavigate}
              className={mobileNavItemClass}
            >
              <MapPin className="h-4 w-4 shrink-0" />
              {AUTH_NAV_LABELS.ADDRESS_BOOK}
            </Link>
            {(session.user.role === "admin" || session.user.role === "super_admin") && (
              <Link
                href={ROUTES.ADMIN.DASHBOARD}
                onClick={onNavigate}
                className={mobileNavItemClass}
              >
                <Settings className="h-4 w-4 shrink-0" />
                {AUTH_NAV_LABELS.ADMIN}
              </Link>
            )}
          </div>
          <div className="mt-2 border-t border-border pt-2">
            <Button
              type="button"
              variant="ghost"
              className={cn(
                mobileNavItemClass,
                "text-destructive hover:bg-red-50 hover:text-destructive"
              )}
              onClick={() => {
                onNavigate?.();
                signOut({ callbackUrl: "/" });
              }}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {AUTH_NAV_LABELS.SIGN_OUT}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
