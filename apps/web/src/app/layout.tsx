import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { PwaRegister } from "@/components/pwa-register";

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "DineSutra — Enterprise Restaurant & Bar Operating System · By SutraUniverse",
  description:
    "Production-ready multi-tenant restaurant management, high-speed touch POS, AI CCTV Vision, kitchen display system, recipe inventory, and Indian GST billing engine. Part of the SutraUniverse business suite.",
  manifest: "/manifest.json",
  icons: {
    icon: "/dinesutra-logo.svg",
    shortcut: "/dinesutra-logo.svg",
    apple: "/dinesutra-logo.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DineSutra",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full font-sans bg-slate-50/60 text-slate-900 antialiased" suppressHydrationWarning>
        <PwaRegister />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
