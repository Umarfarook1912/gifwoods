import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import { ROUTES } from "@/constants/routes";
import { buildLoginHref } from "@/lib/auth/callback-url";
import { getAdminRoutePermission, hasAdminModuleAccess } from "@/constants/admin-permissions";

const ADMIN_PATHS = ["/admin"];
const AUTH_REQUIRED_PATHS = ["/orders", "/checkout", "/profile"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const returnPath = `${pathname}${req.nextUrl.search}`;

  // 1. Check if user is deactivated (inactive status)
  if (session?.user?.status === "inactive" && !pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL(`${ROUTES.LOGIN}?error=InactiveAccount`, req.url));
  }

  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isAuthRequired = AUTH_REQUIRED_PATHS.some((p) => pathname.startsWith(p));

  // 2. Protect Admin Paths
  if (isAdminPath) {
    if (!session) {
      return NextResponse.redirect(new URL(buildLoginHref(returnPath), req.url));
    }
    
    const role = session.user.role;
    
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.redirect(new URL(ROUTES.HOME, req.url));
    }

    // Granular permission check for admins
    if (role === "admin") {
      const permissions = session.user.permissions || [];
      const requiredPermission = getAdminRoutePermission(pathname);

      if (requiredPermission && !hasAdminModuleAccess(permissions, requiredPermission)) {
        return NextResponse.redirect(new URL("/admin/403", req.url));
      }
    }
  }

  // 3. Protect Auth Required Paths
  if (isAuthRequired && !session) {
    return NextResponse.redirect(new URL(buildLoginHref(returnPath), req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
