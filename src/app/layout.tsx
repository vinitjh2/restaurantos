import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "SutraUniverse — The Next-Gen Business Operating System & Cloud Suite",
  description:
    "Unified mission-critical software for modern businesses: DineSutra (Restaurant OS & AI CCTV), RankSutra (AI GEO & Local SEO Radar), KioskSutra (Smart Self-Ordering Kiosks), and enterprise cloud solutions.",
  applicationName: "SutraUniverse",
  authors: [{ name: "SutraUniverse" }],
  keywords: [
    "SutraUniverse",
    "DineSutra",
    "RankSutra",
    "KioskSutra",
    "Restaurant OS",
    "AI CCTV",
    "Local SEO",
    "GEO Search",
    "Google 3-Pack Heatmap",
    "QR Kiosk",
    "Business Cloud Suite",
  ],
  openGraph: {
    title: "SutraUniverse — The Next-Gen Business Operating System & Cloud Suite",
    description:
      "Unified mission-critical software for modern businesses: DineSutra (Restaurant OS & AI CCTV), RankSutra (AI GEO & Local SEO Radar), and KioskSutra (Smart Self-Ordering Kiosks).",
    url: "https://sutrauniverse.com",
    siteName: "SutraUniverse",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://sutrauniverse.com/sutra-universe-logo.svg",
        width: 1200,
        height: 630,
        alt: "SutraUniverse Master Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SutraUniverse — Next-Gen Business Operating System",
    description:
      "All-in-one business software: DineSutra, RankSutra, KioskSutra & Enterprise Cloud Suite.",
    images: ["https://sutrauniverse.com/sutra-universe-logo.svg"],
  },
  icons: {
    icon: "/sutra-universe-logo.svg",
    shortcut: "/sutra-universe-logo.svg",
    apple: "/sutra-universe-logo.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen selection:bg-amber-500 selection:text-white">
        {/* Google Analytics 4 (G-KTV68HQQGZ) & Google Tag Manager (GTM-KD73GWFX) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KTV68HQQGZ"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtm.js?id=GTM-KD73GWFX"
          strategy="afterInteractive"
        />
        <Script id="google-tags" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KTV68HQQGZ', {
              page_path: window.location.pathname,
            });
            gtag('config', 'GTM-KD73GWFX');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}

