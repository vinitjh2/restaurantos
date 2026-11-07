import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { PwaRegister } from "@/components/pwa-register";

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "RestaurantOS — Enterprise F&B Operating System & POS",
  description:
    "Production-ready multi-tenant restaurant management, high-speed touch POS, kitchen display system, recipe inventory, and Indian GST billing engine.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RestaurantOS",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full font-sans bg-slate-50/60 text-slate-900 antialiased">
        <PwaRegister />
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
      </body>
    </html>
  );
}
