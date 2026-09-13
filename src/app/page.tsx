import React from 'react';
import Link from 'next/link';
import { prisma, serializeData } from '@/lib/prisma';
import { SoftwareCard } from '@/components/catalog/SoftwareCard';
import {
  Sparkles,
  Gamepad2,
  Laptop,
  Smartphone,
  Swords,
  Flame,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  ArrowRight,
  Download,
  Server,
  Lock,
} from 'lucide-react';
import { SoftwareItemData, CategoryData } from '@/types';

// Server Component fetching home catalog data
export default async function HomePage() {
  const [categories, trendingGames, topSoftware, mobileHighlights, totalDownloads] =
    await Promise.all([
      prisma.category.findMany({
        orderBy: { orderIndex: 'asc' },
        include: { _count: { select: { items: true } } },
      }),
      prisma.softwareItem.findMany({
        where: {
          isPublished: true,
          category: { slug: 'computer-games' },
        },
        include: {
          category: true,
          downloadFiles: true,
          tags: { include: { tag: true } },
        },
        take: 3,
        orderBy: [{ isTrending: 'desc' }, { downloadCount: 'desc' }],
      }),
      prisma.softwareItem.findMany({
        where: {
          isPublished: true,
          category: { slug: 'computer-software' },
        },
        include: {
          category: true,
          downloadFiles: true,
          tags: { include: { tag: true } },
        },
        take: 3,
        orderBy: [{ averageRating: 'desc' }, { downloadCount: 'desc' }],
      }),
      prisma.softwareItem.findMany({
        where: {
          isPublished: true,
          category: {
            slug: { in: ['mobile-apps', 'mobile-games'] },
          },
        },
        include: {
          category: true,
          downloadFiles: true,
          tags: { include: { tag: true } },
        },
        take: 4,
        orderBy: [{ downloadCount: 'desc' }],
      }),
      prisma.downloadLog.count(),
    ]);

  const serializedGames = serializeData(trendingGames) as unknown as SoftwareItemData[];
  const serializedSoftware = serializeData(topSoftware) as unknown as SoftwareItemData[];
  const serializedMobile = serializeData(mobileHighlights) as unknown as SoftwareItemData[];
  const serializedCategories = serializeData(categories) as unknown as CategoryData[];

  const categoryIcons: Record<string, React.ReactNode> = {
    'computer-games': <Gamepad2 className="h-6 w-6 text-cyan-400" />,
    'computer-software': <Laptop className="h-6 w-6 text-indigo-400" />,
    'mobile-apps': <Smartphone className="h-6 w-6 text-emerald-400" />,
    'mobile-games': <Swords className="h-6 w-6 text-rose-400" />,
  };

  return (
    <div className="relative overflow-hidden pb-20">
      {/* Background Radial Glow */}
      <div className="pointer-events-none absolute inset-0 bg-radial-glow opacity-80" />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-14 sm:px-6 lg:px-8 text-center">
        {/* Floating Architecture Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-slate-900/80 px-4 py-1.5 text-xs font-semibold text-cyan-300 shadow-lg shadow-cyan-950/40 backdrop-blur-xl mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Next-Gen High-Speed Download Hub</span>
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Discover, Select & Bulk Download <br className="hidden sm:inline" />
          <span className="text-gradient-cyan">Games, Software & Mobile Apps</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
          Commercial distribution platform with Postgres Row-Level Security, multi-select bulk downloads, Cloudflare CDN delivery, and AI-grounded catalog discovery.
        </p>

        {/* Hero CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/catalog"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-indigo-600 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500 hover:scale-105 transition-all"
          >
            <Layers className="h-4 w-4" />
            <span>Explore Entire Catalog</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/catalog?category=computer-games"
            className="flex items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:border-cyan-400/50 hover:bg-slate-800 transition-all backdrop-blur-xl"
          >
            <Gamepad2 className="h-4 w-4 text-cyan-400" />
            <span>Browse PC Games</span>
          </Link>
        </div>

        {/* Platform Metric Badges */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-center gap-2 text-cyan-400 mb-1">
              <Zap className="h-4 w-4" />
              <span className="text-xl font-bold font-mono">1000+</span>
            </div>
            <p className="text-[11px] text-slate-400">Concurrent User Capacity</p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-center gap-2 text-emerald-400 mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xl font-bold font-mono">Postgres RLS</span>
            </div>
            <p className="text-[11px] text-slate-400">User Data Isolation</p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-center gap-2 text-indigo-400 mb-1">
              <Download className="h-4 w-4" />
              <span className="text-xl font-bold font-mono">Signed URLs</span>
            </div>
            <p className="text-[11px] text-slate-400">Expiring CDN Delivery</p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-center gap-2 text-amber-400 mb-1">
              <Server className="h-4 w-4" />
              <span className="text-xl font-bold font-mono">Zero-Ops</span>
            </div>
            <p className="text-[11px] text-slate-400">Solo Developer Deployable</p>
          </div>
        </div>
      </section>

      {/* Category Discovery Cards */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-2.5 text-lg font-bold text-white tracking-tight">
            <Zap className="h-5 w-5 text-cyan-400" />
            <span>Explore by Category</span>
          </h2>
          <Link
            href="/catalog"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            View All Categories <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {serializedCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalog?category=${cat.slug}`}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 hover:border-cyan-500/50 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-cyan-950/20 transition-all duration-300"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 border border-slate-800 mb-4 group-hover:border-cyan-500/40 group-hover:scale-105 transition-all">
                  {categoryIcons[cat.slug] || <Layers className="h-6 w-6 text-cyan-400" />}
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-cyan-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono text-cyan-400 font-semibold">
                  {cat._count?.items || 0} items
                </span>
                <span className="group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-cyan-300 flex items-center gap-1">
                  Browse <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Computer Games Section */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="flex items-center gap-2.5 text-lg font-bold text-white tracking-tight">
              <Flame className="h-5 w-5 text-rose-500" />
              <span>Trending Computer Games</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select multiple titles using the checkboxes for 1-click sequential bulk download.
            </p>
          </div>
          <Link
            href="/catalog?category=computer-games"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            All Games <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {serializedGames.map((game) => (
            <SoftwareCard key={game.id} software={game} />
          ))}
        </div>
      </section>

      {/* Top Computer Software & Utilities Section */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="flex items-center gap-2.5 text-lg font-bold text-white tracking-tight">
              <Cpu className="h-5 w-5 text-indigo-400" />
              <span>Developer Tools & High-Performance Software</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Top rated IDEs, video editors, security suites, and utilities.
            </p>
          </div>
          <Link
            href="/catalog?category=computer-software"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            All Software <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {serializedSoftware.map((item) => (
            <SoftwareCard key={item.id} software={item} />
          ))}
        </div>
      </section>

      {/* Mobile Apps & Mobile Games Section */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="flex items-center gap-2.5 text-lg font-bold text-white tracking-tight">
              <Smartphone className="h-5 w-5 text-emerald-400" />
              <span>Mobile Apps & Mobile Games (APKs)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified Android APKs and cross-platform mobile experiences.
            </p>
          </div>
          <Link
            href="/catalog?category=mobile-apps"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            All Mobile Items <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {serializedMobile.map((mob) => (
            <SoftwareCard key={mob.id} software={mob} />
          ))}
        </div>
      </section>

      {/* AI Search & Solo Developer Feature Spotlight Banner */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/40 p-8 sm:p-10 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/30">
              <Sparkles className="h-3.5 w-3.5" /> Zenith AI Grounded Catalog Guide
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Can&apos;t find what you&apos;re looking for? Ask Zenith AI.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Use natural language queries like &ldquo;Find me a photo editor under 200MB&rdquo; or &ldquo;Suggest offline action games for Linux&rdquo;. Zenith AI searches our database directly so you get real, working downloads with zero hallucinations.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/catalog"
                className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors"
              >
                Search Catalog Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
