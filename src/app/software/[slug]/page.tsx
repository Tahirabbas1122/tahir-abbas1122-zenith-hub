import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma, serializeData } from '@/lib/prisma';
import { ScreenshotGallery } from '@/components/catalog/ScreenshotGallery';
import { SystemRequirements } from '@/components/catalog/SystemRequirements';
import { ReviewSection } from '@/components/catalog/ReviewSection';
import { SoftwareCard } from '@/components/catalog/SoftwareCard';
import { SingleItemDownloader } from './SingleItemDownloader';
import {
  Star,
  Download,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Building2,
  Terminal,
} from 'lucide-react';
import { SoftwareItemData, ReviewData } from '@/types';
import { formatDate, formatDownloadCount, getLicenseBadge } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await prisma.softwareItem.findUnique({
    where: { slug },
    select: { title: true, tagline: true },
  });

  if (!item) {
    return { title: 'Software Not Found | Zenith Software Hub' };
  }

  return {
    title: `${item.title} - Download | Zenith Software Hub`,
    description: item.tagline,
  };
}

export default async function SoftwareDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const item = await prisma.softwareItem.findUnique({
    where: { slug },
    include: {
      category: true,
      screenshots: { orderBy: { orderIndex: 'asc' } },
      downloadFiles: { orderBy: { isPrimary: 'desc' } },
      systemRequirements: true,
      tags: { include: { tag: true } },
      reviews: {
        where: { isApproved: true },
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!item || !item.isPublished) {
    notFound();
  }

  // Fetch related items
  const related = await prisma.softwareItem.findMany({
    where: {
      categoryId: item.categoryId,
      id: { not: item.id },
      isPublished: true,
    },
    include: {
      category: true,
      downloadFiles: true,
    },
    take: 3,
  });

  const serializedItem = serializeData(item) as unknown as SoftwareItemData;
  const serializedRelated = serializeData(related) as unknown as SoftwareItemData[];
  const licenseBadge = getLicenseBadge(item.license);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 pb-24">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-cyan-400">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
        <Link href={`/catalog?category=${item.category?.slug}`} className="hover:text-cyan-400">
          {item.category?.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
        <span className="text-slate-200 font-medium truncate">{item.title}</span>
      </nav>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Info Column */}
          <div className="flex items-start gap-5 flex-1 min-w-0">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 p-1.5 shadow-xl">
              <img
                src={item.iconUrl}
                alt={item.title}
                className="h-full w-full object-cover rounded-xl"
              />
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${licenseBadge.color}`}>
                  {licenseBadge.label}
                </span>
                <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-slate-700">
                  v{item.version}
                </span>
                {item.isFeatured && (
                  <span className="flex items-center gap-1 rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/30">
                    <Sparkles className="h-3 w-3" /> Featured
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {item.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {item.tagline}
              </p>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Building2 className="h-3.5 w-3.5 text-slate-500" /> {item.developer}
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Star className="h-3.5 w-3.5 fill-amber-400" /> {item.averageRating.toFixed(1)}
                  <span className="text-slate-500 font-normal">({item.ratingCount} reviews)</span>
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Download className="h-3.5 w-3.5 text-slate-500" /> {formatDownloadCount(item.downloadCount)} downloads
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Calendar className="h-3.5 w-3.5" /> {formatDate(item.releaseDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Action / Download Trigger Column */}
          <div className="lg:w-80 flex-shrink-0">
            <SingleItemDownloader software={serializedItem} />
          </div>
        </div>
      </div>

      {/* Main Grid: Screenshots + Description & Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Screenshots & Detailed Description */}
        <div className="lg:col-span-2 space-y-8">
          {/* Screenshots Gallery */}
          {serializedItem.screenshots && serializedItem.screenshots.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" /> Visual Gallery & Previews
              </h3>
              <ScreenshotGallery screenshots={serializedItem.screenshots} title={item.title} />
            </div>
          )}

          {/* Detailed Overview */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-400" /> Overview & Feature Highlights
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
            {item.detailedDescription && (
              <div className="pt-4 border-t border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {item.detailedDescription}
              </div>
            )}
          </div>

          {/* System Requirements Tab */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="h-5 w-5 text-cyan-400" /> Hardware & System Specifications
            </h3>
            <SystemRequirements requirements={serializedItem.systemRequirements || []} />
          </div>

          {/* User Reviews & Ratings */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
            <ReviewSection
              softwareId={item.id}
              initialReviews={(serializedItem.reviews || []) as ReviewData[]}
              averageRating={item.averageRating}
              ratingCount={item.ratingCount}
            />
          </div>
        </div>

        {/* Right 1 Column: File Details, SHA-256 Hashes, Security & Related Items */}
        <div className="space-y-6">
          {/* File Verification & Integrity Card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Integrity & Safety
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Direct CDN Delivery</span>
                <span className="text-emerald-400 font-semibold">Verified Safe</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Postgres RLS Tracking</span>
                <span className="text-cyan-400 font-semibold">User Isolated</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Expiring Signed URLs</span>
                <span className="text-indigo-400 font-semibold">30 Min Window</span>
              </div>
            </div>
          </div>

          {/* Related Recommendations in same category */}
          {serializedRelated.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" /> Related in {item.category?.name}
              </h4>
              <div className="space-y-4">
                {serializedRelated.map((rel) => (
                  <SoftwareCard key={rel.id} software={rel} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
