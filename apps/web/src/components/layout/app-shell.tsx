"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { useRestaurantStore } from "@/stores/restaurant-store";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { setSessionData } = useRestaurantStore();

  const isAuthOrStandalone =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/cfd") ||
    pathname.startsWith("/qr-order") ||
    pathname.startsWith("/downloads");

  // Proactively hydrate user session from /api/auth/me for fresh browser profiles
  useEffect(() => {
    if (!isAuthOrStandalone) {
      let isMounted = true;
      fetch("/api/auth/me")
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((data) => {
          if (isMounted && data?.success && data.organization) {
            setSessionData({
              organization: data.organization,
              branches: data.organization.branches,
            });
          }
        })
        .catch(() => {
          // Gracefully handle offline or network hiccups without throwing
        });

      return () => {
        isMounted = false;
      };
    }
  }, [pathname, isAuthOrStandalone, setSessionData]);

  // Clean full-screen presentation for login, registration, and customer displays
  if (isAuthOrStandalone) {
    return <div className="min-h-screen w-full bg-slate-950">{children}</div>;
  }

  // Standard multi-column application layout for authenticated operations
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Main Collapsible Sidebar */}
      <Sidebar />

      {/* Right Main Application Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
