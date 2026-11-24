import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;
  const isDineAdmin = host.toLowerCase().includes("dineadmin");

  // Handle dedicated Admin domain: dineadmin.sutrauniverse.com
  if (isDineAdmin) {
    if (pathname === "/" || pathname === "/landing") {
      const sessionToken = request.cookies.get("restaurantos_session")?.value;
      if (sessionToken) {
        return NextResponse.redirect(new URL("/platform-admin", request.url));
      } else {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", "/platform-admin");
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // 1. Allow public routes, static assets, and auth APIs
  const isPublicPath =
    pathname === "/" ||
    pathname.startsWith("/landing") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/refund") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/cfd") ||
    pathname.startsWith("/qr-order") ||
    pathname.startsWith("/downloads") ||
    pathname.startsWith("/waiter") ||
    pathname.startsWith("/mobile") ||
    pathname.startsWith("/tutorial") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/pos/menu") ||
    pathname.startsWith("/api/pos/tables") ||
    pathname.startsWith("/api/pos/orders/kot") ||
    pathname.startsWith("/api/kds/tickets") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname === "/favicon.ico" ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".ico");

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
     * - static images / assets (.jpg, .jpeg, .png, .svg, .webp, .ico)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|svg|webp|ico)$).*)",
  ],
};
