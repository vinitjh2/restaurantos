"use client";

import React from "react";

interface DineSutraLogoProps {
  className?: string;
  variant?: "full" | "icon";
  height?: number | string;
}

export const DineSutraLogo: React.FC<DineSutraLogoProps> = ({
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
        aria-label="DineSutra"
      >
        <defs>
          <linearGradient id="dsIconGrad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="50%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#BE123C" />
          </linearGradient>
          <linearGradient id="dsGoldGrad" x1="20" y1="14" x2="48" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>

        {/* Ring Handle */}
        <circle cx="32" cy="11.5" r="4.5" stroke="url(#dsIconGrad)" strokeWidth="3" fill="none" />
        
        {/* Cloche Dome */}
        <path d="M12 40 C12 24 21 15.5 32 15.5 C43 15.5 52 24 52 40 H12 Z" fill="url(#dsIconGrad)" />

        {/* Negative space fork-cut through dome center */}
        <path d="M30 23 H34 V30 C34 31.5 33 32.5 32 32.5 C31 32.5 30 31.5 30 30 V23 Z" fill="white" />
        <line x1="32" y1="32.5" x2="32" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="28.5" y1="23" x2="28.5" y2="28" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="35.5" y1="23" x2="35.5" y2="28" stroke="white" strokeWidth="1.6" strokeLinecap="round" />

        {/* Platter Base Tray */}
        <path d="M8 43.5 C8 42 9.5 41 11.5 41 H52.5 C54.5 41 56 42 56 43.5 C56 45 54.5 46 52.5 46 H11.5 C9.5 46 8 45 8 43.5 Z" fill="url(#dsIconGrad)" />

        {/* Floating Under-rim in Gold */}
        <path d="M18 49 C18 48 19.5 47.5 21.5 47.5 H42.5 C44.5 47.5 46 48 46 49 C46 50 44.5 50.5 42.5 50.5 H21.5 C19.5 50.5 18 50 18 49 Z" fill="url(#dsGoldGrad)" />

        {/* Sparkle Star Accent */}
        <path d="M47 13 L48.2 16.5 L51.5 17.5 L48.2 18.5 L47 22 L45.8 18.5 L42.5 17.5 L45.8 16.5 Z" fill="url(#dsGoldGrad)" />
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
      aria-label="DineSutra — Restaurant & Dine-In OS"
    >
      <defs>
        <linearGradient id="dsLockGrad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="50%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#BE123C" />
        </linearGradient>
        <linearGradient id="dsLockGold" x1="20" y1="14" x2="48" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* Ring Handle */}
      <circle cx="32" cy="11.5" r="4.5" stroke="url(#dsLockGrad)" strokeWidth="3" fill="none" />
      
      {/* Cloche Dome */}
      <path d="M12 40 C12 24 21 15.5 32 15.5 C43 15.5 52 24 52 40 H12 Z" fill="url(#dsLockGrad)" />

      {/* Negative space fork-cut through dome center */}
      <path d="M30 23 H34 V30 C34 31.5 33 32.5 32 32.5 C31 32.5 30 31.5 30 30 V23 Z" fill="white" />
      <line x1="32" y1="32.5" x2="32" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="28.5" y1="23" x2="28.5" y2="28" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="35.5" y1="23" x2="35.5" y2="28" stroke="white" strokeWidth="1.6" strokeLinecap="round" />

      {/* Platter Base Tray */}
      <path d="M8 43.5 C8 42 9.5 41 11.5 41 H52.5 C54.5 41 56 42 56 43.5 C56 45 54.5 46 52.5 46 H11.5 C9.5 46 8 45 8 43.5 Z" fill="url(#dsLockGrad)" />

      {/* Floating Under-rim in Gold */}
      <path d="M18 49 C18 48 19.5 47.5 21.5 47.5 H42.5 C44.5 47.5 46 48 46 49 C46 50 44.5 50.5 42.5 50.5 H21.5 C19.5 50.5 18 50 18 49 Z" fill="url(#dsLockGold)" />

      {/* Sparkle Star Accent */}
      <path d="M47 13 L48.2 16.5 L51.5 17.5 L48.2 18.5 L47 22 L45.8 18.5 L42.5 17.5 L45.8 16.5 Z" fill="url(#dsLockGold)" />

      {/* Typography */}
      <text
        x="72"
        y="34"
        fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        fontSize="22"
        fontWeight="800"
        letterSpacing="-0.03em"
        fill="#0F172A"
      >
        DINE<tspan fill="#E11D48">SUTRA</tspan>
      </text>
      <text
        x="73"
        y="48"
        fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        fontSize="9.5"
        fontWeight="700"
        letterSpacing="0.14em"
        fill="#BE123C"
      >
        RESTAURANT & DINE-IN OS
      </text>
    </svg>
  );
};
