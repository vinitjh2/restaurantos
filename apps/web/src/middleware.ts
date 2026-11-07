import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public routes, static assets, and auth APIs
  const isPublicPath =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/cfd") ||
    pathname.startsWith("/qr-order") ||
    pathname.startsWith("/downloads") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/pos/menu") ||
    pathname.startsWith("/api/pos/tables") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname === "/favicon.ico";

  if (isPublicPath) {
    return NextResponse.next();
  }

  // 2. Check for active session cookie
  const sessionToken = request.cookies.get("restaurantos_session")?.value;

  // If no session token, redirect to login page
  if (!sessionToken) {
    // For API requests, return 401 JSON instead of redirect
    if (pathname.startsWith("/api/")) {
      return NextResponse.next(); // API routes handle getTenantContext
    }

    const loginUrl = new URL("/login", request.url);
    const returnDestination = pathname + (request.nextUrl.search || "");
    loginUrl.searchParams.set("redirect", returnDestination);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
