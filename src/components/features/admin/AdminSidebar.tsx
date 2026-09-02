"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Star,
  Tags,
  ChevronRight,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ROUTES } from "@/constants/routes";
import { ADMIN_PERMISSION_IDS, hasAdminModuleAccess } from "@/constants/admin-permissions";
import { SITE_NAME } from "@/constants/ui";

const NAV_ITEMS = [
  { href: ROUTES.ADMIN.DASHBOARD, label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
  { href: ROUTES.ADMIN.PRODUCTS, label: "Products", icon: Package, key: "products" },
  { href: ROUTES.ADMIN.CATEGORIES, label: "Categories", icon: Tags, key: "categories" },
  { href: ROUTES.ADMIN.ORDERS, label: "Orders", icon: ShoppingBag, key: "orders" },
  { href: ROUTES.ADMIN.ADMINS, label: "Admins", icon: Shield, key: ADMIN_PERMISSION_IDS.ADMINS, matchPrefix: "/admin/admins" },
  { href: ROUTES.ADMIN.CUSTOMERS, label: "Users", icon: Users, key: ADMIN_PERMISSION_IDS.CUSTOMERS, matchPrefix: "/admin/customers" },
  { href: ROUTES.ADMIN.REVIEWS, label: "Reviews", icon: Star, key: "reviews" },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = session?.user?.role;
  const permissions = session?.user?.permissions || [];

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (role === "super_admin") return true;
    if (role === "admin") {
      return hasAdminModuleAccess(permissions, item.key);
    }
    return false;
  });

  return (
    <aside className="w-56 h-screen bg-dark border-r border-white/10 flex-shrink-0 hidden md:flex flex-col">
      <div className="p-5 border-b border-white/10">
        <Link href="/">
          <span className="font-display font-bold text-lg text-gold">{SITE_NAME}</span>
        </Link>
        <p className="text-white/40 text-xs mt-0.5">Admin Panel</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {visibleItems.map((item) => {
          const { href, label, icon: Icon } = item;
          const matchPrefix = "matchPrefix" in item ? item.matchPrefix : href;
          const active =
            pathname === href ||
            pathname.startsWith(`${href}/`) ||
            (matchPrefix === "/admin/admins" && pathname.startsWith("/admin/users"));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-gold text-dark"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="h-3 w-3" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/10">
        <Link href="/" className="text-xs text-white/40 hover:text-white/70 transition-colors">
          ← Back to store
        </Link>
      </div>
    </aside>
  );
}
