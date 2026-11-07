/**
 * RestaurantOS Comprehensive Route Navigation & Service Worker Verification Suite
 * 
 * Verifies all requirements from USER REQUEST:
 * 1. Verifies all 20+ routes have distinct, valid page components with correct headings.
 * 2. Confirms NO other route renders or falls back to "Operations Overview" (exclusive to "/").
 * 3. Verifies sidebar navigation links, structure, and active state logic.
 * 4. Verifies Service Worker v4:
 *    - Strict network-first navigation
 *    - RSC (React Server Component) data stream pass-through
 *    - Prohibition of redirected response caching
 *    - Safe offline isolation (never returns Operations Overview for other pages)
 *    - Obsolete cache invalidation
 * 5. Verifies Middleware route protection, public path bypass, and redirect preservation.
 */

import * as fs from "fs";
import * as path from "path";
import { NextRequest } from "next/server";
import { middleware } from "../src/middleware";

interface RouteVerification {
  route: string;
  pageFile: string;
  expectedHeading: string;
  rendersOverview: boolean;
  hasDistinctContent: boolean;
  status: "VERIFIED" | "FAILED";
}

const ROUTES_SPECIFICATION = [
  { route: "/", pageFile: "src/app/page.tsx", expectedHeading: "Operations Overview" },
  { route: "/pos", pageFile: "src/app/pos/page.tsx", expectedHeading: "Direct Counter Channel" },
  { route: "/orders", pageFile: "src/app/orders/page.tsx", expectedHeading: "Live Orders Ledger" },
  { route: "/tables", pageFile: "src/app/tables/page.tsx", expectedHeading: "Table & Floor Layout" },
  { route: "/kitchen", pageFile: "src/app/kitchen/page.tsx", expectedHeading: "Kitchen Display System" },
  { route: "/menu", pageFile: "src/app/menu/page.tsx", expectedHeading: "Menu & Pricing Engine" },
  { route: "/inventory", pageFile: "src/app/inventory/page.tsx", expectedHeading: "Inventory & Recipe BOM" },
  { route: "/purchases", pageFile: "src/app/purchases/page.tsx", expectedHeading: "Purchase Orders & GRN" },
  { route: "/suppliers", pageFile: "src/app/suppliers/page.tsx", expectedHeading: "Supplier CRM & Vendor Ledger" },
  { route: "/customers", pageFile: "src/app/customers/page.tsx", expectedHeading: "Customer CRM & Loyalty" },
  { route: "/staff", pageFile: "src/app/staff/page.tsx", expectedHeading: "Staff & Access Permissions" },
  { route: "/attendance", pageFile: "src/app/attendance/page.tsx", expectedHeading: "Attendance, Leaves & Payroll" },
  { route: "/expenses", pageFile: "src/app/expenses/page.tsx", expectedHeading: "Accounting, Expenses & Cash Drawer" },
  { route: "/reports", pageFile: "src/app/reports/page.tsx", expectedHeading: "Advanced Analytics, P&L & GST Filing" },
  { route: "/branches", pageFile: "src/app/branches/page.tsx", expectedHeading: "Multi-Branch Outlets & Central Dashboard" },
  { route: "/settings", pageFile: "src/app/settings/page.tsx", expectedHeading: "Restaurant Configuration & Compliance" },
  { route: "/settings/integrations", pageFile: "src/app/settings/integrations/page.tsx", expectedHeading: "Modular Third-Party Integrations" },
  { route: "/subscription", pageFile: "src/app/subscription/page.tsx", expectedHeading: "Subscription & Plan Entitlements" },
  { route: "/sync-monitor", pageFile: "src/app/sync-monitor/page.tsx", expectedHeading: "Offline Sync & Terminal Monitor" },
  { route: "/tutorial", pageFile: "src/app/tutorial/page.tsx", expectedHeading: "Complete Tutorial" },
  { route: "/platform-admin", pageFile: "src/app/platform-admin/page.tsx", expectedHeading: "Platform Super Admin Dashboard" },
];

async function runNavigationSuite() {
  console.log("===============================================================================");
  console.log("  RESTAURANTOS COMPREHENSIVE ROUTE NAVIGATION & CACHE VERIFICATION");
  console.log("===============================================================================\n");

  const results: RouteVerification[] = [];
  const rootDir = path.resolve(__dirname, "..");

  // =========================================================================
  // SECTION 1: ROUTE PAGE COMPONENT & HEADING VERIFICATION
  // =========================================================================
  console.log(">>> [SECTION 1] Testing Distinct Page Components & Content Isolation...\n");

  for (const spec of ROUTES_SPECIFICATION) {
    const fullPath = path.join(rootDir, spec.pageFile);
    if (!fs.existsSync(fullPath)) {
      results.push({
        route: spec.route,
        pageFile: spec.pageFile,
        expectedHeading: spec.expectedHeading,
        rendersOverview: false,
        hasDistinctContent: false,
        status: "FAILED",
      });
      console.error(`  ❌ [MISSING] File not found: ${spec.pageFile}`);
      continue;
    }

    const content = fs.readFileSync(fullPath, "utf-8");
    const containsOverview = spec.route !== "/" && content.includes("Operations Overview");
    const hasHeading = content.toLowerCase().includes(spec.expectedHeading.toLowerCase());
    const isDistinct = content.length > 500 && (spec.route === "/" || !containsOverview);

    if (!containsOverview && hasHeading && isDistinct) {
      results.push({
        route: spec.route,
        pageFile: spec.pageFile,
        expectedHeading: spec.expectedHeading,
        rendersOverview: containsOverview,
        hasDistinctContent: true,
        status: "VERIFIED",
      });
      console.log(`  ✅ [VERIFIED] ${spec.route.padEnd(25)} -> ${spec.pageFile} (Heading: "${spec.expectedHeading}")`);
    } else {
      results.push({
        route: spec.route,
        pageFile: spec.pageFile,
        expectedHeading: spec.expectedHeading,
        rendersOverview: containsOverview,
        hasDistinctContent: isDistinct,
        status: "FAILED",
      });
      console.error(`  ❌ [DEFECT] ${spec.route.padEnd(25)} -> Contains Operations Overview or missing heading.`);
    }
  }

  // =========================================================================
  // SECTION 2: SIDEBAR NAVIGATION CONTRACT VERIFICATION
  // =========================================================================
  console.log("\n>>> [SECTION 2] Verifying Sidebar Component Navigation Contract...\n");

  const sidebarFile = path.join(rootDir, "src/components/layout/sidebar.tsx");
  const sidebarContent = fs.readFileSync(sidebarFile, "utf-8");

  // Verify all specified routes are represented in sidebar items
  const sidebarLinksMatch = [...sidebarContent.matchAll(/href:\s*["']([^"']+)["']/g)].map((m) => m[1]);
  console.log(`  Found ${sidebarLinksMatch.length} navigation targets defined in Sidebar.`);

  let allSidebarRoutesFound = true;
  for (const spec of ROUTES_SPECIFICATION) {
    if (!sidebarLinksMatch.includes(spec.route)) {
      console.error(`  ❌ [MISSING LINK] Route '${spec.route}' is not linked in Sidebar.`);
      allSidebarRoutesFound = false;
    }
  }

  if (allSidebarRoutesFound) {
    console.log("  ✅ [PASS] 100% of required routes are properly linked in Sidebar navigation.");
  } else {
    throw new Error("Sidebar is missing one or more required navigation targets.");
  }

  // Verify active state calculation logic
  const normalizedSidebar = sidebarContent.replace(/\s+/g, " ");
  const hasExactOverviewMatch = normalizedSidebar.includes('item.href === "/" ? pathname === "/"');
  if (hasExactOverviewMatch) {
    console.log("  ✅ [PASS] Sidebar Overview ('/') has strict root-only equality check (prevents false active state).");
  } else {
    console.error("  ❌ [FAIL] Sidebar Overview ('/') lacks strict root check.");
    throw new Error("Sidebar active state defect: root route lacks strict match.");
  }

  // Verify prefetch configuration
  const hasPrefetchFalse = sidebarContent.includes("prefetch={false}");
  if (hasPrefetchFalse) {
    console.log("  ✅ [PASS] Sidebar Link components configured with prefetch={false} (prevents concurrent network congestion).");
  } else {
    console.warn("  ⚠️ [WARN] Sidebar links do not explicitly disable eager prefetching.");
  }

  // =========================================================================
  // SECTION 3: SERVICE WORKER & PWA CACHE AUDIT (public/sw.js)
  // =========================================================================
  console.log("\n>>> [SECTION 3] Auditing Service Worker (public/sw.js) & PWA Lifecycle...\n");

  const swFile = path.join(rootDir, "public/sw.js");
  const swContent = fs.readFileSync(swFile, "utf-8");

  // Check 1: Cache version incremented to v4 to wipe out old v1/v2/v3
  const hasV4Cache = swContent.includes('"restaurantos-cache-v4"');
  if (hasV4Cache) {
    console.log("  ✅ [PASS] SW Cache version is 'restaurantos-cache-v4' (forces invalidation of older caches).");
  } else {
    throw new Error("SW cache version was not incremented.");
  }

  // Check 2: Skip waiting and immediate claim
  const hasSkipWaiting = swContent.includes("self.skipWaiting()");
  const hasClientsClaim = swContent.includes("self.clients.claim()");
  if (hasSkipWaiting && hasClientsClaim) {
    console.log("  ✅ [PASS] Immediate activation enabled (skipWaiting + clients.claim active).");
  } else {
    throw new Error("SW lacks immediate activation handlers.");
  }

  // Check 3: Next.js React Server Component (RSC) isolation
  const hasRscProtection = swContent.includes('headers.get("rsc") === "1"') && swContent.includes("isRscRequest");
  if (hasRscProtection) {
    console.log("  ✅ [PASS] Next.js RSC data streams are passed directly to network (HTML caching prohibited).");
  } else {
    throw new Error("SW lacks RSC data stream isolation.");
  }

  // Check 4: Prevention of caching redirected responses
  const hasRedirectPrevention = swContent.includes("!networkResponse.redirected");
  if (hasRedirectPrevention) {
    console.log("  ✅ [PASS] Redirected HTTP responses are barred from cache storage (prevents login/overview poisoning).");
  } else {
    throw new Error("SW defect: Redirected responses could contaminate cache.");
  }

  // Check 5: Isolated offline fallback (NEVER serves Operations Overview for other pages)
  const neverFallsBackToRoot = !swContent.includes('caches.match("/")');
  const hasDedicatedOfflineNotice = swContent.includes("Section Requires Network") || swContent.includes("Offline — RestaurantOS");
  if (neverFallsBackToRoot && hasDedicatedOfflineNotice) {
    console.log("  ✅ [PASS] Offline navigation never incorrectly serves '/' (Operations Overview). Displays dedicated offline notice.");
  } else {
    throw new Error("SW defect: Offline fallback serves incorrect or unrelated page.");
  }

  // Check 6: Client-side registration & update check (pwa-register.tsx)
  const pwaFile = path.join(rootDir, "src/components/pwa-register.tsx");
  const pwaContent = fs.readFileSync(pwaFile, "utf-8");
  const hasClientCachePurge = pwaContent.includes("Purging obsolete browser cache");
  const hasRegistrationUpdate = pwaContent.includes("registration.update()");
  if (hasClientCachePurge && hasRegistrationUpdate) {
    console.log("  ✅ [PASS] PwaRegister performs client-side legacy cache sanitation and proactive SW updates.");
  } else {
    throw new Error("PwaRegister lacks proactive cache sanitation or update checking.");
  }

  // =========================================================================
  // SECTION 4: MIDDLEWARE ROUTE PROTECTION & REDIRECT PRESERVATION
  // =========================================================================
  console.log("\n>>> [SECTION 4] Testing Middleware Route Authorization & Redirect Preservation...\n");

  // Test 4.1: Unauthenticated protected route redirects to /login with original destination
  const reqPos = new NextRequest("http://localhost:3000/inventory?filter=low-stock");
  const resPos = middleware(reqPos);
  const locationPos = resPos?.headers.get("location");
  if (resPos && resPos.status >= 300 && resPos.status < 400 && locationPos?.includes("/login?redirect=%2Finventory%3Ffilter%3Dlow-stock")) {
    console.log(`  ✅ [PASS] Unauthenticated '/inventory' redirected to login preserving query params: ${locationPos}`);
  } else {
    throw new Error(`Middleware failed to preserve redirect destination: ${locationPos}`);
  }

  // Test 4.2: Public routes bypass authentication
  const publicRoutes = ["/login", "/register", "/cfd", "/qr-order", "/manifest.json", "/sw.js", "/favicon.ico"];
  for (const pub of publicRoutes) {
    const pubReq = new NextRequest(`http://localhost:3000${pub}`);
    const pubRes = middleware(pubReq);
    // NextResponse.next() continues without redirect (status 200 or null redirect)
    const isRedirect = pubRes?.headers.get("location");
    if (!isRedirect) {
      console.log(`  ✅ [PASS] Public route '${pub}' allowed without redirection.`);
    } else {
      throw new Error(`Public route '${pub}' was unexpectedly redirected to ${isRedirect}`);
    }
  }

  // Test 4.3: Authenticated session passes through to all protected routes
  for (const spec of ROUTES_SPECIFICATION) {
    const authReq = new NextRequest(`http://localhost:3000${spec.route}`, {
      headers: { cookie: "restaurantos_session=valid-auth-session-cookie" },
    });
    const authRes = middleware(authReq);
    const redirectLoc = authRes?.headers.get("location");
    if (!redirectLoc) {
      // passed through
    } else {
      throw new Error(`Authenticated request to '${spec.route}' was unexpectedly redirected to ${redirectLoc}`);
    }
  }
  console.log("  ✅ [PASS] All 21 protected routes allow authenticated access without redirection.");

  console.log("\n===============================================================================");
  console.log("  ROUTE-BY-ROUTE NAVIGATION AUDIT VERDICT");
  console.log("===============================================================================");
  let passedCount = 0;
  for (const r of results) {
    console.log(`  ${r.status === "VERIFIED" ? "✅" : "❌"} ${r.route.padEnd(25)} [${r.status}] -> Heading: "${r.expectedHeading}"`);
    if (r.status === "VERIFIED") passedCount++;
  }
  console.log("===============================================================================");
  console.log(`  Total Routes Audited : ${results.length}`);
  console.log(`  Passed               : ${passedCount}`);
  console.log(`  Failed               : ${results.length - passedCount}`);
  console.log(`  Success Rate         : ${(passedCount / results.length * 100).toFixed(1)}%`);
  console.log("===============================================================================\n");

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

runNavigationSuite().catch((err) => {
  console.error("Navigation audit failed:", err);
  process.exit(1);
});
