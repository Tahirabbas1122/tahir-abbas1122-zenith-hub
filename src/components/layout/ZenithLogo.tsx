'use client';

import React from 'react';
import Link from 'next/link';

interface ZenithLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  linkToHome?: boolean;
}

export function ZenithLogo({
  size = 'md',
  showSubtitle = true,
  className = '',
  linkToHome = true,
}: ZenithLogoProps) {
  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9 sm:h-10 sm:w-10',
    lg: 'h-12 w-12',
  };

  const titleSizes = {
    sm: 'text-sm font-black',
    md: 'text-base sm:text-lg font-black',
    lg: 'text-xl sm:text-2xl font-black',
  };

  const content = (
    <div className={`group inline-flex items-center gap-2.5 select-none shrink-0 ${className}`}>
      {/* Modern Stylized Geometric 'Z' Apex / Summit Mark */}
      <div
        className={`relative flex ${iconSizes[size]} items-center justify-center rounded-xl bg-slate-900 border border-cyan-500/40 p-1.5 shadow-lg shadow-cyan-500/15 group-hover:border-cyan-400 group-hover:shadow-cyan-500/30 group-hover:scale-105 transition-all duration-300 overflow-hidden shrink-0`}
      >
        {/* Subtle Background Glow Inside Icon */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/30 via-indigo-600/20 to-purple-600/30 opacity-80" />
        
        {/* Scalable Vector Stylized Z Summit Mark */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 h-full w-full drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
        >
          <defs>
            <linearGradient id="zenith-z-grad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="45%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <linearGradient id="zenith-accent-grad" x1="16" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* Top Bar of Z with Summit Arrow */}
          <path
            d="M 6 8 L 26 8 L 19 15 L 23 15 L 26 8"
            fill="url(#zenith-z-grad)"
          />
          {/* Main Diagonal Vertex */}
          <path
            d="M 26 8 L 11 24 L 26 24 L 26 26 L 6 26 L 21 10 L 6 10 Z"
            fill="url(#zenith-z-grad)"
          />
          {/* Ascending Peak / Zenith Node */}
          <circle cx="16" cy="5" r="2.2" fill="url(#zenith-accent-grad)" />
          <path
            d="M 16 3 L 18 6 L 14 6 Z"
            fill="#38bdf8"
          />
        </svg>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col justify-center whitespace-nowrap min-w-0 leading-tight">
        <div className={`tracking-tight text-white group-hover:text-cyan-400 transition-colors ${titleSizes[size]}`}>
          ZENITH <span className="text-cyan-400 font-light">HUB</span>
        </div>
        {showSubtitle && (
          <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
            Software & Games
          </span>
        )}
      </div>
    </div>
  );

  if (linkToHome) {
    return (
      <Link href="/" className="inline-block shrink-0 focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
