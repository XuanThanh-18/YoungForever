// ═══════════════════════════════════════════════════════════════════
// FILE: fe/src/middleware.ts   (đặt ở root của src/)
// Bảo vệ route – dùng cookie access_token để check auth phía edge
// ═══════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes yêu cầu đăng nhập
const PROTECTED_PATHS = [
  "/profile",
  "/orders",
  "/checkout",
  "/wishlist",
  "/notifications",
];

// Routes chỉ dành cho admin/staff
const ADMIN_PATHS = ["/admin"];

// Routes không được vào khi đã đăng nhập
const AUTH_PATHS = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;
  const isLoggedIn = Boolean(accessToken);

  // Redirect admin
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (!isLoggedIn) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    // Role check happens in page/layout (token decode)
  }

  // Redirect unauthenticated to login
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p)) && !isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated away from auth pages
  if (AUTH_PATHS.some((p) => pathname.startsWith(p)) && isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match tất cả paths TRỪ:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
