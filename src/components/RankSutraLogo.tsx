import React from "react";

interface RankSutraLogoProps {
  className?: string;
  variant?: "full" | "icon" | "mark";
  size?: number;
}

export const RankSutraLogo: React.FC<RankSutraLogoProps> = ({
  className = "",
  variant = "full",
  size = 40,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="rs-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="50%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="rs-apex" x1="0%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          <linearGradient id="rs-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="60%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <linearGradient id="rs-orbit" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>

          <filter id="rs-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Hex Shield / Radar Housing */}
        <polygon
          points="50,4 92,26 92,74 50,96 8,74 8,26"
          fill="url(#rs-bg)"
          stroke="#4f46e5"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Concentric Geo Radar Rings */}
        <circle cx="50" cy="50" r="34" stroke="#6366f1" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        <circle cx="50" cy="50" r="22" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
        <circle cx="50" cy="50" r="10" stroke="#a855f7" strokeWidth="1" opacity="0.5" />

        {/* Radar Crosshairs */}
        <line x1="16" y1="50" x2="84" y2="50" stroke="#6366f1" strokeWidth="0.8" opacity="0.3" />
        <line x1="50" y1="16" x2="50" y2="84" stroke="#6366f1" strokeWidth="0.8" opacity="0.3" />

        {/* Ascending Peak / Chevron Triangle (#1 Rank) */}
        <path
          d="M50 18 L76 68 L50 56 L24 68 Z"
          fill="url(#rs-apex)"
          filter="url(#rs-glow)"
          opacity="0.95"
        />

        {/* Inner Golden Apex Star / Pin Nexus */}
        <path
          d="M50 32 L53 43 L64 43 L55 50 L58 60 L50 54 L42 60 L45 50 L36 43 L47 43 Z"
          fill="url(#rs-gold)"
        />

        {/* Glowing Pulsar Core Pin */}
        <circle cx="50" cy="48" r="3.5" fill="#ffffff" />

        {/* Top Rank Beacon Spark */}
        <circle cx="50" cy="18" r="2.5" fill="#38bdf8" filter="url(#rs-glow)" />
      </svg>

      {/* Brand Typography */}
      {variant === "full" && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span className="text-xl font-black tracking-tight text-slate-900">
              Rank
            </span>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
              Sutra
            </span>
            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 ml-0.5">
              GEO
            </span>
          </div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
            Local Maps &amp; AI Search Engine
          </span>
        </div>
      )}
    </div>
  );
};
