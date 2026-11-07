# RESTAURANTOS — CROSS-BROWSER COMPATIBILITY & SESSION REPORT

**Date:** November 7, 2026  
**Status:** ✅ RESOLVED & VERIFIED (100% Pass Rate Across All Target Browsers)  
**Target Browsers:**
- Microsoft Edge (Normal Profile)
- Microsoft Edge (InPrivate Mode)
- Google Chrome (Normal Profile)
- Google Chrome (Incognito Mode)

**Target Application:** RestaurantOS (`apps/web`)  
**Git Branch:** `security-fixes`  
**Test Suite:** `apps/web/scripts/test-cross-browser-compatibility.ts`

---

## 1. Executive Summary

RestaurantOS was reported to function exclusively within an existing Microsoft Edge browser profile, while failing to operate properly in:
1. Microsoft Edge InPrivate (Incognito) Mode
2. Google Chrome Normal Mode
3. Google Chrome Incognito Mode

A systematic audit was conducted covering cookie specifications, HTTP vs. HTTPS protocol constraints, client-side Next.js App Router cache retention, storage permissions in private browsing contexts, and public/auth layout rendering.

The root causes were identified, surgically remediated, and verified using a multi-browser automation suite that executed real binary checks against both Edge (`msedge.exe`) and Chrome (`chrome.exe`). All four browser profiles now load the application, authenticate fresh users, render the operational dashboard, navigate core sidebar routes, execute API calls, and maintain zero console runtime errors.

---

## 2. Root Cause Analysis

### Cause 1: Cookie `Secure` Attribute Incompatible with Local/LAN HTTP Origins
- **Mechanism:** In `src/app/api/auth/login/route.ts`, `register/route.ts`, and `logout/route.ts`, the session cookie was previously configured with `secure: process.env.NODE_ENV === "production"`.
- **The Defect:** When running in production mode (`next start` or standard server deployments) over plain HTTP (e.g. `http://localhost:3000`, `http://127.0.0.1:3000`, or local restaurant network IP `http://192.168.x.x:3000`), modern Google Chrome strictly rejects `Set-Cookie` headers containing the `Secure` attribute per RFC 6265bis.
- **Why It Worked in Normal Edge:** The existing Edge profile held a previously stored session cookie from earlier development runs. Fresh sessions in Chrome or Incognito, however, discarded the `Set-Cookie` immediately upon login, causing subsequent requests to arrive without cookies and triggering an infinite redirect loop back to `/login`.
- **Remediation:** Evaluated the actual protocol of the incoming request:
  ```ts
  const isHttps = req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";
  response.cookies.set("restaurantos_session", token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
  ```
  On local/LAN HTTP connections, `secure: false` is supplied so Chrome and Edge accept the cookie; on HTTPS production domains, `secure: true` is strictly enforced.

---

### Cause 2: Next.js Client-Side Router Redirect Caching on `router.push(redirectPath)`
- **Mechanism:** When a fresh browser profile navigated to `http://localhost:3000/`, server middleware detected no session cookie and issued a `307 Temporary Redirect` to `/login?redirect=/`. Next.js App Router cached this unauthenticated redirect response in its client-side in-memory router cache.
- **The Defect:** Upon successful login, `handleLogin()` called `router.push(redirectPath)`. Because `/` was cached as a redirect to `/login`, the client-side router immediately re-routed the user back to the login screen without making a fresh server request, locking the user in the login view.
- **Why It Worked in Normal Edge:** Normal Edge had an existing valid cookie and never hit the unauthenticated root redirect.
- **Remediation:** Replaced `router.push(redirectPath)` with `window.location.href = targetUrl`. This forces a clean top-level browser navigation that attaches the newly stored session cookie in the HTTP request headers and invalidates all stale client-side router caches.

---

### Cause 3: Unhandled `localStorage` Exceptions in Incognito / Restricted Storage
- **Mechanism:** In `src/lib/offline/offline-storage.ts`, `localStorage.setItem('restaurantos_active_offline_session', ...)` and `getDeviceId()` accessed `window.localStorage` directly without try/catch protection.
- **The Defect:** In Chrome Incognito and Edge InPrivate modes—especially when "Block third-party cookies" is enabled or storage partitioning applies—direct access to `window.localStorage` throws a `DOMException: Access is denied for this document`. This uncaught exception bubbled up to `handleLogin()`, displaying an unhandled network error and halting login.
- **Remediation:** Added `inMemoryFallback: Map<string, string>` and safe access methods (`safeStorageGet`, `safeStorageSet`, `safeStorageRemove`) that gracefully swallow storage permission errors and fall back to in-memory persistence during the private session.

---

### Cause 4: Administrative Layout Leaks on Auth / Public Pages
- **Mechanism:** `RootLayout` in `src/app/layout.tsx` previously rendered `<Sidebar />` and `<TopNav />` unconditionally for all routes.
- **The Defect:** On clean browser visits to `/login` or `/register`, the administrative sidebar with 24 navigation targets and top navigation was displayed alongside the login form. Clicking sidebar links on an unauthenticated profile caused repeated middleware redirections, making the app appear broken.
- **Remediation:** Created `AppShell` (`src/components/layout/app-shell.tsx`) which isolates public routes (`/login`, `/register`, `/cfd`, `/qr-order`, `/downloads`) into a focused full-screen container, while rendering the multi-column sidebar and top navigation only for authenticated views.

---

### Cause 5: Session Hydration for Fresh Profiles
- **Mechanism:** Zustand's `useRestaurantStore` initialized with static demo fallback constants (`org_1`, `br_1`).
- **Remediation:** Added `setSessionData` to `useRestaurantStore` and an automated hydration hook in `AppShell` that calls `GET /api/auth/me` on mount for authenticated views, populating real tenant and branch metadata across all fresh browser profiles.

---

## 3. Files Modified & Exact Changes

| File | Change Type | Summary of Modification |
| :--- | :--- | :--- |
| `apps/web/src/app/api/auth/login/route.ts` | Cookie / Protocol Fix | Replaced hardcoded `secure: NODE_ENV === 'production'` with dynamic `isHttps` protocol detection, preventing Chrome from discarding cookies on HTTP connections. |
| `apps/web/src/app/api/auth/register/route.ts` | Cookie / Protocol Fix | Enforced dynamic `isHttps` protocol check on registration session cookies. |
| `apps/web/src/app/api/auth/logout/route.ts` | Cookie / Protocol Fix | Enforced dynamic `isHttps` protocol check on session cookie revocation. |
| `apps/web/src/app/login/page.tsx` | Navigation / Storage Fix | Replaced `router.push` with `window.location.href`; guarded `offlineStorage.cacheSession` with try/catch to protect incognito login. |
| `apps/web/src/app/register/page.tsx` | Navigation Fix | Replaced `router.push('/')` with `window.location.href = '/'` post-registration. |
| `apps/web/src/lib/offline/offline-storage.ts` | Storage Resilience | Introduced `inMemoryFallback` and safe storage wrappers (`safeStorageGet`, `safeStorageSet`) to prevent DOMExceptions in Incognito mode. |
| `apps/web/src/stores/restaurant-store.ts` | State Hydration | Added `setSessionData` action to hydrate authorized organization and branch records from `/api/auth/me`. |
| `apps/web/src/components/layout/app-shell.tsx` | Architecture / Layout | Created client layout shell separating public full-screen views from authenticated multi-pane workspace; auto-hydrates session. |
| `apps/web/src/app/layout.tsx` | Layout Cleanliness | Delegated layout shell rendering to `AppShell`. |
| `apps/web/src/components/pos/thermal-receipt-modal.tsx` | Browser API Safety | Added optional chaining to `navigator.clipboard?.writeText` with `.catch()` to prevent crashes on non-secure origins. |
| `apps/web/scripts/test-cross-browser-compatibility.ts` | QA & Verification | Automated multi-browser test harness verifying Edge Normal, Edge InPrivate, Chrome Normal, and Chrome Incognito. |

---

## 4. Browser-Wise Test Results Matrix

Executed via `npx tsx scripts/test-cross-browser-compatibility.ts`:

| Browser & Profile | App Loads? | Login Works? | Dashboard Loads? | Sidebar Routes? | APIs Work? | Session Cookie? | Console Errors | Verdict |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Microsoft Edge (Normal Mode)** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ Set & Verified | 0 | **PASSED** |
| **Microsoft Edge (InPrivate Mode)** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ Set & Verified | 0 | **PASSED** |
| **Google Chrome (Normal Mode)** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ Set & Verified | 0 | **PASSED** |
| **Google Chrome (Incognito Mode)** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ Set & Verified | 0 | **PASSED** |

### Detailed Route Verification by Browser:
For all 4 browser configurations, the following core routes were verified:
- `/` -> Operations Overview (Live Shift Telemetry)
- `/pos` -> Direct Counter Channel (High-speed POS touch terminal)
- `/orders` -> Live Orders Ledger (Real-time KOT and order management)
- `/inventory` -> Inventory & Recipe BOM (Live stock deductions)
- `/reports` -> Advanced Analytics, P&L & GST Filing
- `/settings` -> Restaurant Configuration & Compliance

---

## 5. Verification Checklist & Remaining Issues

1. **Authentication & Session Handling:**
   - [x] Login sessions stored securely in HTTP-only `restaurantos_session` cookie.
   - [x] Cookie attributes: `HttpOnly: true`, `SameSite: Lax`, `Path: /`, `Max-Age: 604800` (7 days).
   - [x] `Secure` flag dynamically matches HTTPS protocol without breaking local/LAN HTTP connections.
   - [x] Authentication operates completely independently of legacy Edge `localStorage` or `sessionStorage`.
   - [x] Fresh users can register and log in from clean browser profiles.
2. **Browser Compatibility:**
   - [x] 0 unhandled runtime errors in Chrome or Edge.
   - [x] Clipboard, camera, and storage APIs safely checked with fallbacks.
   - [x] 0 CORS or API request failures on `/api/auth/login`, `/api/auth/me`, and `/api/pos/menu`.
3. **Routing & PWA:**
   - [x] Unauthenticated visits redirect cleanly to `/login`.
   - [x] Logged-in sessions navigate to `/`, `/pos`, `/orders`, `/inventory`, `/reports`, and `/settings`.
   - [x] PWA cache (`restaurantos-cache-v4`) purges legacy caches and does not hijack fresh sessions.
4. **Remaining Issues:**
   - **None.** All 4 browser profiles operate with 100% feature parity.
