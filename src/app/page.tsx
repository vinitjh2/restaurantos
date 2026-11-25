import { Metadata } from "next";
import { SutraUniversePortal } from "@/components/SutraUniversePortal";

export const metadata: Metadata = {
  title: "SutraUniverse — The Next-Gen Business Operating System & Cloud Suite",
  description:
    "Explore the SutraUniverse ecosystem of enterprise-grade cloud operating systems built for Bharat & global commerce. Featuring KioskSutra, DineSutra, RankSutra, StaySutra and more.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SutraUniversePortal />
    </main>
  );
}
