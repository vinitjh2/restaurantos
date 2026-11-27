"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { DineSutraAIChatBot } from "@/components/chat/DineSutraAIChatBot";
import { useRestaurantStore } from "@/stores/restaurant-store";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { setSessionData } = useRestaurantStore();

  const isStandaloneView =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/landing" ||
    pathname.startsWith("/landing") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/refund") ||
    pathname.startsWith("/cfd") ||
    pathname.startsWith("/qr-order") ||
    pathname.startsWith("/downloads") ||
    pathname.startsWith("/waiter") ||
    pathname.startsWith("/mobile") ||
    pathname.startsWith("/platform-admin");

  const isPureAuth = pathname === "/login" || pathname === "/register";

  // Proactively hydrate user session from /api/auth/me for fresh browser profiles
  // and gate unpaid/suspended restaurant accounts cleanly to /subscription.
  useEffect(() => {
    if (!isPureAuth) {
      let isMounted = true;
      fetch("/api/auth/me")
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((data) => {
          if (!isMounted || !data?.success || !data.organization) return;
          setSessionData({
            user: data.user || null,
            organization: data.organization,
            branches: data.organization.branches,
          });

          const orgStatus = String(data.organization.status || "").toUpperCase();
          const role = String(data.user?.role || "").toUpperCase();
          const isPlatformRole = role === "PLATFORM_OWNER" || role === "PLATFORM_AUDITOR";
          const isExemptRoute =
            isStandaloneView || pathname.startsWith("/subscription");

          if (
            !isPlatformRole &&
            !isExemptRoute &&
            (orgStatus === "PENDING_PAYMENT" || orgStatus === "SUSPENDED")
          ) {
            window.location.href = "/subscription?paymentRequired=1";
          }
        })
        .catch(() => {
          // Gracefully handle offline or network hiccups without throwing
        });

      return () => {
        isMounted = false;
      };
    }
  }, [pathname, isPureAuth, isStandaloneView, setSessionData]);

  // Clean full-screen presentation for standalone views (waiter, mobile, customer display, login)
  if (isStandaloneView) {
    const isDarkBg =
      pathname === "/login" ||
      pathname === "/register" ||
      pathname.startsWith("/cfd");

    const hideChatBot =
      pathname.startsWith("/qr-order") ||
      pathname.startsWith("/cfd") ||
      pathname.startsWith("/waiter") ||
      pathname.startsWith("/mobile") ||
      pathname.startsWith("/platform-admin");

    return (
      <div
        className={`min-h-screen w-full ${
          isDarkBg ? "bg-slate-950" : "bg-slate-100"
        }`}
        suppressHydrationWarning
      >
        {children}
        {!hideChatBot && <DineSutraAIChatBot />}
      </div>
    );
  }

  // Standard multi-column application layout for authenticated operations
  return (
    <div className="flex h-screen w-full overflow-hidden" suppressHydrationWarning>
      {/* Main Collapsible Sidebar */}
      <Sidebar />

      {/* Right Main Application Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
          {children}
        </main>
      </div>
      <DineSutraAIChatBot />
    </div>
  );
}
