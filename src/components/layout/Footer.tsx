import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Server,
  Heart,
  Gamepad2,
  Laptop,
  Smartphone,
  Swords,
  Lock,
} from 'lucide-react';
import { ZenithLogo } from './ZenithLogo';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <ZenithLogo size="md" showSubtitle={false} />
            <p className="text-xs leading-relaxed text-slate-400">
              The premier unified commercial software & gaming download platform. Verified binaries, high-speed CDN delivery, and AI-grounded discovery.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-mono">
              <ShieldCheck className="h-3.5 w-3.5" /> 100% Virus-Free & SHA-256 Verified
            </div>
          </div>

          {/* Catalog Categories */}
          <div>
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              <Zap className="h-3.5 w-3.5 text-cyan-400" /> Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/catalog?category=computer-games"
                  className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
                >
                  <Gamepad2 className="h-3.5 w-3.5 text-slate-500" /> Computer Games
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog?category=computer-software"
                  className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
                >
                  <Laptop className="h-3.5 w-3.5 text-slate-500" /> Computer Software
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog?category=mobile-apps"
                  className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
                >
                  <Smartphone className="h-3.5 w-3.5 text-slate-500" /> Mobile Apps (APKs)
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog?category=mobile-games"
                  className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
                >
                  <Swords className="h-3.5 w-3.5 text-slate-500" /> Mobile Games
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Isolation Architecture */}
          <div>
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              <Lock className="h-3.5 w-3.5 text-indigo-400" /> Architecture & Trust
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span> Postgres Row-Level Security
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span> Cloudflare R2 Expiring URLs
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span> Isolated Multi-Tenant Schema
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span> Single Solo-Dev Maintained
              </li>
            </ul>
          </div>

          {/* Quick Links & Deployment */}
          <div>
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              <Server className="h-3.5 w-3.5 text-emerald-400" /> Deployment Ready
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Hosted seamlessly on Vercel with Managed Postgres and Object Storage with zero server ops.
            </p>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-[11px] font-mono text-slate-300">
              ⚡ Status: <span className="text-emerald-400">Operational (1000+ CCU Ready)</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Zenith Software Hub. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-500 text-[11px]">
            Engineered with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> for Solo Developers
          </div>
        </div>
      </div>
    </footer>
  );
}
