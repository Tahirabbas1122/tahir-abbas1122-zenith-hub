'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  Download,
  Check,
  Plus,
  Bookmark,
  Monitor,
  Apple,
  HardDrive,
  Smartphone,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { SoftwareItemData } from '@/types';
import { useDownloadBasket } from '@/context/DownloadBasketContext';
import { formatDownloadCount, getLicenseBadge } from '@/lib/utils';
import { useSession } from 'next-auth/react';

interface SoftwareCardProps {
  software: SoftwareItemData;
  onWishlistToggle?: (softwareId: string, isSaved: boolean) => void;
}

export function SoftwareCard({ software, onWishlistToggle }: SoftwareCardProps) {
  const { data: session } = useSession();
  const { isItemInBasket, toggleItem } = useDownloadBasket();
  const [isSaved, setIsSaved] = useState(software.isSaved || false);
  const [isSaving, setIsSaving] = useState(false);
  const inBasket = isItemInBasket(software.id);

  const licenseInfo = getLicenseBadge(software.license);
  const primaryFile =
    software.downloadFiles?.find((f) => f.isPrimary) || software.downloadFiles?.[0];

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      alert('Please sign in to save items to your wishlist.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ softwareId: software.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.saved);
        onWishlistToggle?.(software.id, data.saved);
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBasketToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(software, primaryFile);
  };

  // Render platform badges
  const platforms = Array.from(
    new Set(software.downloadFiles?.map((f) => f.platform) || [])
  );

  return (
    <div
      className={`group relative flex flex-col rounded-2xl border transition-all duration-300 ${
        inBasket
          ? 'border-cyan-500/80 bg-slate-900/90 shadow-lg shadow-cyan-500/10'
          : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-cyan-950/20'
      }`}
    >
      {/* Top Banner / Selection Bar */}
      <div className="p-4 pb-0 flex items-start justify-between gap-3">
        {/* Multi-Select Bulk Checkbox */}
        <button
          onClick={handleBasketToggle}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 px-2 py-1 text-[11px] font-medium text-slate-300 hover:border-cyan-400 hover:text-cyan-300 transition-all group-hover:border-cyan-500/50"
          title={inBasket ? 'Remove from download basket' : 'Select for bulk download'}
        >
          {inBasket ? (
            <>
              <CheckSquare className="h-3.5 w-3.5 text-cyan-400 fill-cyan-400/20" />
              <span className="text-cyan-400 font-semibold">Selected</span>
            </>
          ) : (
            <>
              <Square className="h-3.5 w-3.5 text-slate-400" />
              <span>Select</span>
            </>
          )}
        </button>

        {/* License Badge & Wishlist Button */}
        <div className="flex items-center gap-1.5">
          <span
            className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${licenseInfo.color}`}
          >
            {licenseInfo.label}
          </span>
          <button
            onClick={handleWishlistClick}
            disabled={isSaving}
            className={`rounded-lg p-1.5 transition-colors ${
              isSaved
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
            }`}
            title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <Link href={`/software/${software.slug}`} className="p-4 flex-1 flex flex-col">
        <div className="flex items-start gap-3.5 mb-3">
          {/* Software Icon */}
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-1 shadow-inner group-hover:border-cyan-500/40 transition-colors">
            <img
              src={software.iconUrl}
              alt={software.title}
              className="h-full w-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>

          {/* Title & Metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-white group-hover:text-cyan-400 transition-colors truncate">
                {software.title}
              </h3>
              {software.isFeatured && (
                <Sparkles className="h-3 w-3 text-cyan-400 flex-shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              by <span className="text-slate-300">{software.developer}</span> • v{software.version}
            </p>

            {/* Rating & Downloads */}
            <div className="flex items-center gap-3 mt-1.5 text-[11px]">
              <div className="flex items-center gap-1 text-amber-400 font-semibold">
                <Star className="h-3 w-3 fill-amber-400" />
                <span>{software.averageRating.toFixed(1)}</span>
                <span className="text-slate-500 font-normal">({software.ratingCount})</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Download className="h-3 w-3 text-slate-500" />
                <span>{formatDownloadCount(software.downloadCount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4 flex-1">
          {software.tagline}
        </p>

        {/* Footer / Platforms & File Size */}
        <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs">
          {/* Platforms Icons */}
          <div className="flex items-center gap-1.5 text-slate-400">
            {platforms.includes('WINDOWS') && <span title="Windows"><Monitor className="h-3.5 w-3.5 text-sky-400" /></span>}
            {platforms.includes('MACOS') && <span title="macOS"><Apple className="h-3.5 w-3.5 text-slate-300" /></span>}
            {platforms.includes('LINUX') && <span title="Linux"><HardDrive className="h-3.5 w-3.5 text-amber-400" /></span>}
            {(platforms.includes('ANDROID') || platforms.includes('IOS')) && (
              <span title="Mobile APK/iOS"><Smartphone className="h-3.5 w-3.5 text-emerald-400" /></span>
            )}
            <span className="text-[10px] text-slate-500 ml-1">
              {primaryFile?.formattedSize || 'Direct'}
            </span>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={handleBasketToggle}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
              inBasket
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800 text-slate-200 hover:bg-cyan-600 hover:text-slate-950'
            }`}
          >
            {inBasket ? (
              <>
                <Check className="h-3 w-3" /> In Basket
              </>
            ) : (
              <>
                <Plus className="h-3 w-3" /> Add
              </>
            )}
          </button>
        </div>
      </Link>
    </div>
  );
}
