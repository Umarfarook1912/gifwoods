import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import { ROUTES } from "@/constants/routes";

const ADMIN_PATHS = ["/admin"];
const AUTH_REQUIRED_PATHS = ["/orders", "/checkout", "/profile"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isAuthRequired = AUTH_REQUIRED_PATHS.some((p) => pathname.startsWith(p));

  if (isAdminPath) {
    if (!session) {
      return NextResponse.redirect(new URL(ROUTES.LOGIN, req.url));
    }
    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL(ROUTES.HOME, req.url));
    }
  }

  if (isAuthRequired && !session) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`${ROUTES.LOGIN}?callbackUrl=${callbackUrl}`, req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
