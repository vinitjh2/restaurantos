"use client";

import React from "react";

interface KioskSutraLogoProps {
  className?: string;
  variant?: "full" | "icon";
  height?: number | string;
}

export const KioskSutraLogo: React.FC<KioskSutraLogoProps> = ({
  className = "h-10 w-auto",
  variant = "full",
  height,
}) => {
  if (variant === "icon") {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={height ? { height } : undefined}
        aria-label="KioskSutra"
      >
        <defs>
          <linearGradient id="ksIconGrad" x1="6" y1="12" x2="58" y2="54" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="55%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
          <mask id="ksIconCut">
            <rect width="64" height="64" fill="white" />
            <path
              d="M38.5 6.5 C33.5 11 30 15.2 29.8 19.2 C29.6 21.4 28 23.6 25.8 26.2 L19.5 34.5 H30.5 L23.5 57.5 L44.5 28.5 H34.2 C36.8 22.5 40.5 15.2 38.5 6.5 Z"
              fill="black"
              stroke="black"
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
          </mask>
        </defs>
        <path
          d="M12 14 H52 A6.5 6.5 0 0 1 58.5 20.5 V26.5 A5.5 5.5 0 0 0 58.5 37.5 V43.5 A6.5 6.5 0 0 1 52 50 H12 A6.5 6.5 0 0 1 5.5 43.5 V37.5 A5.5 5.5 0 0 0 5.5 26.5 V20.5 A6.5 6.5 0 0 1 12 14 Z"
          fill="url(#ksIconGrad)"
          mask="url(#ksIconCut)"
        />
        <path
          d="M38.5 6.5 C33.5 11 30 15.2 29.8 19.2 C29.6 21.4 28 23.6 25.8 26.2 L19.5 34.5 H30.5 L23.5 57.5 L44.5 28.5 H34.2 C36.8 22.5 40.5 15.2 38.5 6.5 Z"
          fill="url(#ksIconGrad)"
        />
        <path
          d="M36.8 11.5 C34.2 15.2 32.8 18 32.6 20.6 L24.2 32.5 H32.6 L27.6 49.5 L40.2 30.5 H31.8 C33.5 25.5 36.2 19 36.8 11.5 Z"
          fill="#FFFFFF"
          fillOpacity="0.95"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 260 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={height ? { height } : undefined}
      aria-label="KioskSutra — Smart Food Stall OS"
    >
      <defs>
        <linearGradient id="ksLockGrad" x1="6" y1="12" x2="58" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="55%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
        <mask id="ksLockCut">
          <rect width="64" height="64" fill="white" />
          <path
            d="M38.5 6.5 C33.5 11 30 15.2 29.8 19.2 C29.6 21.4 28 23.6 25.8 26.2 L19.5 34.5 H30.5 L23.5 57.5 L44.5 28.5 H34.2 C36.8 22.5 40.5 15.2 38.5 6.5 Z"
            fill="black"
            stroke="black"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
        </mask>
      </defs>
      <path
        d="M12 14 H52 A6.5 6.5 0 0 1 58.5 20.5 V26.5 A5.5 5.5 0 0 0 58.5 37.5 V43.5 A6.5 6.5 0 0 1 52 50 H12 A6.5 6.5 0 0 1 5.5 43.5 V37.5 A5.5 5.5 0 0 0 5.5 26.5 V20.5 A6.5 6.5 0 0 1 12 14 Z"
        fill="url(#ksLockGrad)"
        mask="url(#ksLockCut)"
      />
      <path
        d="M38.5 6.5 C33.5 11 30 15.2 29.8 19.2 C29.6 21.4 28 23.6 25.8 26.2 L19.5 34.5 H30.5 L23.5 57.5 L44.5 28.5 H34.2 C36.8 22.5 40.5 15.2 38.5 6.5 Z"
        fill="url(#ksLockGrad)"
      />
      <path
        d="M36.8 11.5 C34.2 15.2 32.8 18 32.6 20.6 L24.2 32.5 H32.6 L27.6 49.5 L40.2 30.5 H31.8 C33.5 25.5 36.2 19 36.8 11.5 Z"
        fill="#FFFFFF"
        fillOpacity="0.95"
      />
      <text
        x="74"
        y="34"
        fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        fontSize="22"
        fontWeight="800"
        letterSpacing="-0.03em"
        fill="#0F172A"
      >
        KIOSK<tspan fill="#EA580C">SUTRA</tspan>
      </text>
      <text
        x="75"
        y="48"
        fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        fontSize="9.5"
        fontWeight="700"
        letterSpacing="0.14em"
        fill="#EA580C"
      >
        SMART FOOD STALL OS
      </text>
    </svg>
  );
};

