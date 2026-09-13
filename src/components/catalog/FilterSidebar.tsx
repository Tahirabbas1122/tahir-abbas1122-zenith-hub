'use client';

import React from 'react';
import {
  Filter,
  RotateCcw,
  Gamepad2,
  Laptop,
  Smartphone,
  Swords,
  Monitor,
  Apple,
  HardDrive,
  Star,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CategoryData } from '@/types';

interface FilterSidebarProps {
  categories: CategoryData[];
  selectedCategory: string;
  selectedPlatform: string;
  selectedLicense: string;
  selectedMinRating: number;
  selectedMaxSizeMB: number;
  onCategoryChange: (category: string) => void;
  onPlatformChange: (platform: string) => void;
  onLicenseChange: (license: string) => void;
  onMinRatingChange: (rating: number) => void;
  onMaxSizeMBChange: (maxSizeMB: number) => void;
  onResetFilters: () => void;
}

export function FilterSidebar({
  categories,
  selectedCategory,
  selectedPlatform,
  selectedLicense,
  selectedMinRating,
  selectedMaxSizeMB,
  onCategoryChange,
  onPlatformChange,
  onLicenseChange,
  onMinRatingChange,
  onMaxSizeMBChange,
  onResetFilters,
}: FilterSidebarProps) {
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'computer-games':
        return <Gamepad2 className="h-4 w-4 text-cyan-400" />;
      case 'computer-software':
        return <Laptop className="h-4 w-4 text-indigo-400" />;
      case 'mobile-apps':
        return <Smartphone className="h-4 w-4 text-emerald-400" />;
      case 'mobile-games':
        return <Swords className="h-4 w-4 text-rose-400" />;
      default:
        return <Layers className="h-4 w-4 text-slate-400" />;
    }
  };

  const platforms = [
    { label: 'All Platforms', value: 'all', icon: Sparkles },
    { label: 'Windows PC', value: 'WINDOWS', icon: Monitor },
    { label: 'macOS', value: 'MACOS', icon: Apple },
    { label: 'Linux', value: 'LINUX', icon: HardDrive },
    { label: 'Android (APK)', value: 'ANDROID', icon: Smartphone },
    { label: 'iOS', value: 'IOS', icon: Smartphone },
  ];

  const licenses = [
    { label: 'All Licenses', value: 'all' },
    { label: 'Free', value: 'FREE' },
    { label: 'Open Source', value: 'OPEN_SOURCE' },
    { label: 'Freeware', value: 'FREEWARE' },
    { label: 'Free Trial', value: 'TRIAL' },
    { label: 'Commercial', value: 'PAID' },
  ];

  const sizePresets = [
    { label: 'Any File Size', value: 0 },
    { label: 'Under 100 MB', value: 100 },
    { label: 'Under 500 MB', value: 500 },
    { label: 'Under 2 GB', value: 2048 },
    { label: 'Under 10 GB', value: 10240 },
  ];

  const ratings = [
    { label: 'Any Rating', value: 0 },
    { label: '⭐ 4.5 & up', value: 4.5 },
    { label: '⭐ 4.0 & up', value: 4.0 },
    { label: '⭐ 3.5 & up', value: 3.5 },
  ];

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedPlatform !== 'all' ||
    selectedLicense !== 'all' ||
    selectedMinRating > 0 ||
    selectedMaxSizeMB > 0;

  return (
    <aside className="w-full lg:w-64 space-y-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
          <Filter className="h-4 w-4 text-cyan-400" /> Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-2">Category</label>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange('all')}
            className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-slate-400" /> All Categories
            </span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.slug)}
              className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                {getCategoryIcon(cat.slug)}
                <span className="truncate">{cat.name}</span>
              </span>
              {cat._count?.items !== undefined && (
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500 font-mono">
                  {cat._count.items}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Platform Filter */}
      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-2">Platform / OS</label>
        <div className="grid grid-cols-2 gap-1.5">
          {platforms.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPlatform === p.value;
            return (
              <button
                key={p.value}
                onClick={() => onPlatformChange(p.value)}
                className={`flex items-center gap-1.5 rounded-xl border p-2 text-left text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-800/80 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* License Filter */}
      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-2">License Type</label>
        <div className="flex flex-wrap gap-1.5">
          {licenses.map((lic) => (
            <button
              key={lic.value}
              onClick={() => onLicenseChange(lic.value)}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all ${
                selectedLicense === lic.value
                  ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                  : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {lic.label}
            </button>
          ))}
        </div>
      </div>

      {/* Max File Size */}
      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-2">Max Download Size</label>
        <div className="space-y-1">
          {sizePresets.map((sp) => (
            <button
              key={sp.value}
              onClick={() => onMaxSizeMBChange(sp.value)}
              className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-all ${
                selectedMaxSizeMB === sp.value
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span>{sp.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-2">User Rating</label>
        <div className="space-y-1">
          {ratings.map((r) => (
            <button
              key={r.value}
              onClick={() => onMinRatingChange(r.value)}
              className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-all ${
                selectedMinRating === r.value
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
