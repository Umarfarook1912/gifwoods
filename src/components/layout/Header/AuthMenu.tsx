"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { User, LogOut, Package, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROUTES } from "@/constants/routes";
import { buildLoginHref } from "@/lib/auth/callback-url";
import type { ReactNode } from "react";

interface Props {
  icon?: ReactNode;
}

export function AuthMenu({ icon }: Props) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  if (status === "loading") {
    return <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />;
  }

  if (!session) {
    return (
      <Link
        href={buildLoginHref(returnPath)}
        aria-label="Login"
        className="w-9 h-9 rounded-full flex items-center justify-center text-dark hover:bg-gold/10 transition-colors"
      >
        {icon ?? <User className="h-[18px] w-[18px]" />}
      </Link>
    );
  }

  const initials = session.user.name
    ? session.user.name.slice(0, 2).toUpperCase()
    : "GW";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none" aria-label="Open user menu">
        <Avatar className="h-9 w-9 border-2 border-gold/30 hover:border-gold transition-colors">
          <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} />
          <AvatarFallback className="bg-gold text-dark text-xs font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <p className="font-semibold text-sm">{session.user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href={ROUTES.PROFILE} className="flex items-center gap-2 w-full">
            <User className="h-4 w-4" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href={ROUTES.ORDERS} className="flex items-center gap-2 w-full">
            <Package className="h-4 w-4" /> My Orders
          </Link>
        </DropdownMenuItem>
        {session.user.role === "admin" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={ROUTES.ADMIN.DASHBOARD} className="flex items-center gap-2 w-full">
                <Settings className="h-4 w-4" /> Admin
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
