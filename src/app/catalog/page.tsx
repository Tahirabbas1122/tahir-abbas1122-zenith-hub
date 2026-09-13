'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SoftwareCard } from '@/components/catalog/SoftwareCard';
import { SoftwareListItem } from '@/components/catalog/SoftwareListItem';
import { FilterSidebar } from '@/components/catalog/FilterSidebar';
import { SoftwareItemData, CategoryData } from '@/types';
import {
  Layers,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
} from 'lucide-react';

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<SoftwareItemData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [platform, setPlatform] = useState(searchParams.get('platform') || 'all');
  const [license, setLicense] = useState(searchParams.get('license') || 'all');
  const [minRating, setMinRating] = useState(parseFloat(searchParams.get('minRating') || '0'));
  const [maxSizeMB, setMaxSizeMB] = useState(parseInt(searchParams.get('maxSizeMB') || '0', 10));
  const [sort, setSort] = useState(searchParams.get('sort') || 'popular');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sync URL query params on change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (category !== 'all') params.set('category', category);
    if (platform !== 'all') params.set('platform', platform);
    if (license !== 'all') params.set('license', license);
    if (minRating > 0) params.set('minRating', minRating.toString());
    if (maxSizeMB > 0) params.set('maxSizeMB', maxSizeMB.toString());
    if (sort !== 'popular') params.set('sort', sort);
    if (page > 1) params.set('page', page.toString());

    router.replace(`/catalog?${params.toString()}`, { scroll: false });
    fetchCatalogData();
  }, [category, platform, license, minRating, maxSizeMB, sort, page]);

  const fetchCatalogData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (category !== 'all') params.set('category', category);
      if (platform !== 'all') params.set('platform', platform);
      if (license !== 'all') params.set('license', license);
      if (minRating > 0) params.set('minRating', minRating.toString());
      if (maxSizeMB > 0) params.set('maxSizeMB', maxSizeMB.toString());
      params.set('sort', sort);
      params.set('page', page.toString());
      params.set('limit', '12');

      const res = await fetch(`/api/software?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch catalog');

      const data = await res.json();
      setItems(data.items);
      setCategories(data.categories);
      setTotalCount(data.pagination.totalCount);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error('Error loading catalog data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCatalogData();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategory('all');
    setPlatform('all');
    setLicense('all');
    setMinRating(0);
    setMaxSizeMB(0);
    setSort('popular');
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl sm:text-3xl font-black text-white tracking-tight">
            <Layers className="h-7 w-7 text-cyan-400" />
            <span>Software & Games Catalog</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Showing <span className="text-white font-semibold">{totalCount}</span> verified software, games, and APK downloads.
          </p>
        </div>

        {/* View mode toggle & Mobile filter trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300"
          >
            <SlidersHorizontal className="h-4 w-4 text-cyan-400" /> Filters
          </button>

          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-1.5 transition-colors ${
                viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg p-1.5 transition-colors ${
                viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters Desktop */}
        <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block flex-shrink-0`}>
          <FilterSidebar
            categories={categories}
            selectedCategory={category}
            selectedPlatform={platform}
            selectedLicense={license}
            selectedMinRating={minRating}
            selectedMaxSizeMB={maxSizeMB}
            onCategoryChange={(c) => { setCategory(c); setPage(1); }}
            onPlatformChange={(p) => { setPlatform(p); setPage(1); }}
            onLicenseChange={(l) => { setLicense(l); setPage(1); }}
            onMinRatingChange={(r) => { setMinRating(r); setPage(1); }}
            onMaxSizeMBChange={(s) => { setMaxSizeMB(s); setPage(1); }}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 space-y-6">
          {/* Search & Sort Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, description, or developer..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-4 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            </form>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 whitespace-nowrap">Sort:</span>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="popular">Most Downloaded</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Releases</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Software Items List / Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-3" />
              <p className="text-xs">Loading software catalog...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400 space-y-3">
              <Sparkles className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="font-bold text-sm text-slate-200">No matching items found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try adjusting your search terms, clearing size or rating filters, or ask Zenith AI for recommendations.
              </p>
              <button
                onClick={handleResetFilters}
                className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-500"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {items.map((item) => (
                <SoftwareCard key={item.id} software={item} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <SoftwareListItem key={item.id} software={item} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-800 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>

              <span className="text-xs text-slate-400 font-mono">
                Page <span className="text-white font-semibold">{page}</span> of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading catalog...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
