"use client";

import React from "react";

interface SutraUniverseLogoProps {
  className?: string;
  variant?: "full" | "icon" | "badge";
  height?: number | string;
  theme?: "dark" | "light";
}

export const SutraUniverseLogo: React.FC<SutraUniverseLogoProps> = ({
  className = "h-10 w-auto",
  variant = "full",
  height,
  theme = "light",
}) => {
  const isDark = theme === "dark";

  if (variant === "icon") {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={height ? { height } : undefined}
        aria-label="SutraUniverse"
      >
        <defs>
          {/* Cosmic Violet-Magenta Gradient */}
          <linearGradient id="suIconViolet" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#C026D3" />
          </linearGradient>

          {/* Electric Cyan-Blue-Gold Gradient */}
          <linearGradient id="suIconCyanGold" x1="10" y1="18" x2="56" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="55%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          {/* Core Pulsar Gold */}
          <linearGradient id="suIconPulsar" x1="28" y1="26" x2="36" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>

        {/* Orbit Ellipse 1 (Angled -35deg Cyan-Blue) */}
        <ellipse
          cx="32"
          cy="32"
          rx="26"
          ry="11.5"
          transform="rotate(-35 32 32)"
          stroke="url(#suIconCyanGold)"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="92 24"
        />

        {/* Orbiting Golden Planetary Node */}
        <circle cx="50.5" cy="19" r="3.2" fill="#F59E0B" />

        {/* Orbit Ellipse 2 (Angled +35deg Violet-Magenta) */}
        <ellipse
          cx="32"
          cy="32"
          rx="26"
          ry="11.5"
          transform="rotate(35 32 32)"
          stroke="url(#suIconViolet)"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Central Sutra Möbius / S-Nexus Core Ribbon */}
        <path
          d="M25 20.5 C33 20.5 39 24 39 28.5 C39 34 25 31 25 36.5 C25 41.5 31 44.5 39 44.5"
          stroke="url(#suIconViolet)"
          strokeWidth="4.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Central Pulsar Star (8-Point Core Spark) */}
        <path
          d="M32 25.5 L33.4 30.2 L38 32 L33.4 33.8 L32 38.5 L30.6 33.8 L26 32 L30.6 30.2 Z"
          fill="url(#suIconPulsar)"
        />
        {/* Nucleus Center Point */}
        <circle cx="32" cy="32" r="1.6" fill="#FFFFFF" />
      </svg>
    );
  }

  if (variant === "badge") {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={height ? { height } : undefined}
        aria-label="SutraUniverse Badge"
      >
        <defs>
          <linearGradient id="suBadgeBg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E1B4B" />
            <stop offset="50%" stopColor="#2E1065" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="suBadgeGrad" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="50%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>
          <linearGradient id="suBadgeGold" x1="10" y1="18" x2="56" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="60%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Rounded Squircle Container */}
        <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#suBadgeBg)" stroke="#3730A3" strokeWidth="1.2" />

        {/* Orbit Ellipse 1 */}
        <ellipse
          cx="32"
          cy="32"
          rx="21"
          ry="9.5"
          transform="rotate(-35 32 32)"
          stroke="url(#suBadgeGold)"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="72 20"
        />

        {/* Orbiting Satellite Node */}
        <circle cx="47" cy="21" r="2.6" fill="#F59E0B" />

        {/* Orbit Ellipse 2 */}
        <ellipse
          cx="32"
          cy="32"
          rx="21"
          ry="9.5"
          transform="rotate(35 32 32)"
          stroke="url(#suBadgeGrad)"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Central S-Nexus */}
        <path
          d="M26 23 C33 23 37.5 25.5 37.5 29 C37.5 33.5 26.5 31.5 26.5 35.5 C26.5 39.5 31 41.5 37.5 41.5"
          stroke="url(#suBadgeGrad)"
          strokeWidth="3.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Pulsar Star */}
        <path
          d="M32 27 L33 30.5 L36.5 32 L33 33.5 L32 37 L31 33.5 L27.5 32 L31 30.5 Z"
          fill="#FDE68A"
        />
        <circle cx="32" cy="32" r="1.2" fill="#FFFFFF" />
      </svg>
    );
  }

  // Full Brand Lockup (Icon + Typography)
  return (
    <svg
      viewBox="0 0 280 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={height ? { height } : undefined}
      aria-label="SutraUniverse — Master Ecosystem Hub"
    >
      <defs>
        <linearGradient id="suFullViolet" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#C026D3" />
        </linearGradient>

        <linearGradient id="suFullCyanGold" x1="10" y1="18" x2="56" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="55%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        <linearGradient id="suFullPulsar" x1="28" y1="26" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        <linearGradient id="suTextGrad" x1="140" y1="18" x2="260" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#C026D3" />
        </linearGradient>
      </defs>

      {/* ICON GLYPH ON LEFT (0..64) */}
      <g>
        {/* Orbit Ellipse 1 (Cyan-Blue) */}
        <ellipse
          cx="32"
          cy="32"
          rx="26"
          ry="11.5"
          transform="rotate(-35 32 32)"
          stroke="url(#suFullCyanGold)"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="92 24"
        />

        {/* Orbiting Satellite Node */}
        <circle cx="50.5" cy="19" r="3.2" fill="#F59E0B" />

        {/* Orbit Ellipse 2 (Violet-Magenta) */}
        <ellipse
          cx="32"
          cy="32"
          rx="26"
          ry="11.5"
          transform="rotate(35 32 32)"
          stroke="url(#suFullViolet)"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Central Sutra Möbius / S-Nexus Core Ribbon */}
        <path
          d="M25 20.5 C33 20.5 39 24 39 28.5 C39 34 25 31 25 36.5 C25 41.5 31 44.5 39 44.5"
          stroke="url(#suFullViolet)"
          strokeWidth="4.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Central Pulsar Star */}
        <path
          d="M32 25.5 L33.4 30.2 L38 32 L33.4 33.8 L32 38.5 L30.6 33.8 L26 32 L30.6 30.2 Z"
          fill="url(#suFullPulsar)"
        />
        <circle cx="32" cy="32" r="1.6" fill="#FFFFFF" />
      </g>

      {/* TYPOGRAPHY ON RIGHT */}
      <text
        x="72"
        y="35"
        fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        fontSize="24"
        fontWeight="900"
        letterSpacing="-0.04em"
        fill={isDark ? "#FFFFFF" : "#0F172A"}
      >
        SUTRA<tspan fill="url(#suTextGrad)">UNIVERSE</tspan>
      </text>

      <text
        x="73"
        y="49"
        fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        fontSize="9.5"
        fontWeight="800"
        letterSpacing="0.16em"
        fill="#6366F1"
      >
        MASTER ECOSYSTEM HUB
      </text>
    </svg>
  );
};
