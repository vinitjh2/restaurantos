import React from "react";
import type { Metadata } from "next";
import { DineSutraLandingPage } from "@/components/landing/DineSutraLandingPage";

export const metadata: Metadata = {
  title: "DineSutra — India's #1 Cloud Restaurant OS with Table QR & AI CCTV Vision",
  description:
    "Transform your restaurant with 100% UPI Table QR ordering, multi-station KDS routing, Captain handheld billing, and automated 5-minute CCTV waiter alerts. 0% Commission.",
};

export default function HomeMainDomainPage() {
  return <DineSutraLandingPage />;
}
