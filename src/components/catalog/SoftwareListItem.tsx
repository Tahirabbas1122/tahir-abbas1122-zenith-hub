'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { SoftwareItemData } from '@/types';
import { useDownloadBasket } from '@/context/DownloadBasketContext';
import { formatDownloadCount, getLicenseBadge } from '@/lib/utils';
import { useSession } from 'next-auth/react';

interface SoftwareListItemProps {
  software: SoftwareItemData;
  onWishlistToggle?: (softwareId: string, isSaved: boolean) => void;
}

export function SoftwareListItem({ software, onWishlistToggle }: SoftwareListItemProps) {
  const { data: session } = useSession();
  const { isItemInBasket, toggleItem } = useDownloadBasket();
  const [isSaved, setIsSaved] = useState(software.isSaved || false);
  const inBasket = isItemInBasket(software.id);

  const licenseInfo = getLicenseBadge(software.license);
  const primaryFile =
    software.downloadFiles?.find((f) => f.isPrimary) || software.downloadFiles?.[0];

  const platforms = Array.from(
    new Set(software.downloadFiles?.map((f) => f.platform) || [])
  );

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      alert('Please sign in to save items.');
      return;
    }

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
    }
  };

  const handleBasketToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(software, primaryFile);
  };

  return (
    <div
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 transition-all ${
        inBasket
          ? 'border-cyan-500/70 bg-slate-900/90 shadow-md shadow-cyan-500/10'
          : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80'
      }`}
    >
      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
        {/* Multi-Select Bulk Checkbox */}
        <button
          onClick={handleBasketToggle}
          className="mt-1 sm:mt-0 p-1 text-slate-400 hover:text-cyan-400 transition-colors"
          title={inBasket ? 'Remove from basket' : 'Select item'}
        >
          {inBasket ? (
            <CheckSquare className="h-5 w-5 text-cyan-400 fill-cyan-400/20" />
          ) : (
            <Square className="h-5 w-5 text-slate-500" />
          )}
        </button>

        {/* Icon */}
        <Link href={`/software/${software.slug}`} className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-1">
          <img
            src={software.iconUrl}
            alt={software.title}
            className="h-full w-full object-cover rounded-lg"
            loading="lazy"
          />
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/software/${software.slug}`}
              className="font-bold text-sm text-white hover:text-cyan-400 transition-colors truncate"
            >
              {software.title}
            </Link>
            <span className="text-[11px] text-slate-400 font-mono">v{software.version}</span>
            <span
              className={`rounded border px-1.5 py-0.2 text-[9px] font-semibold uppercase ${licenseInfo.color}`}
            >
              {licenseInfo.label}
            </span>
          </div>

          <p className="text-xs text-slate-400 truncate mt-0.5 max-w-xl">
            {software.tagline}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-1.5 text-[11px] text-slate-400">
            <span className="text-slate-500">by {software.developer}</span>
            <div className="flex items-center gap-1 text-amber-400 font-medium">
              <Star className="h-3 w-3 fill-amber-400" />
              <span>{software.averageRating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3 text-slate-500" />
              <span>{formatDownloadCount(software.downloadCount)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              {platforms.includes('WINDOWS') && <Monitor className="h-3 w-3 text-sky-400" />}
              {platforms.includes('MACOS') && <Apple className="h-3 w-3 text-slate-300" />}
              {platforms.includes('LINUX') && <HardDrive className="h-3 w-3 text-amber-400" />}
              {(platforms.includes('ANDROID') || platforms.includes('IOS')) && (
                <Smartphone className="h-3 w-3 text-emerald-400" />
              )}
              <span className="text-slate-500 font-mono text-[10px] ml-1">
                {primaryFile?.formattedSize || '100 MB'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 self-end sm:self-center">
        <button
          onClick={handleWishlistClick}
          className={`rounded-xl p-2 transition-colors ${
            isSaved
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
          }`}
          title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-amber-400' : ''}`} />
        </button>

        <button
          onClick={handleBasketToggle}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
            inBasket
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'bg-cyan-600 text-slate-950 hover:bg-cyan-500 shadow-md shadow-cyan-600/20'
          }`}
        >
          {inBasket ? (
            <>
              <Check className="h-3.5 w-3.5" /> Added to Basket
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" /> Add to Basket
            </>
          )}
        </button>
      </div>
    </div>
  );
}
