'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Gamepad2,
  Laptop,
  Smartphone,
  Swords,
  Search,
  ShoppingBag,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  Layers,
  History,
  Bookmark,
} from 'lucide-react';
import { useDownloadBasket } from '@/context/DownloadBasketContext';
import { ZenithLogo } from './ZenithLogo';

export function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const { itemCount, formattedTotalSize, toggleDrawer } = useDownloadBasket();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const categories = [
    { name: 'Games', slug: 'computer-games', icon: Gamepad2 },
    { name: 'Software', slug: 'computer-software', icon: Laptop },
    { name: 'Mobile Apps', slug: 'mobile-apps', icon: Smartphone },
    { name: 'Mobile Games', slug: 'mobile-games', icon: Swords },
  ];

  const userName = session?.user?.name || 'Account';
  const userInitial = userName?.[0]?.toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
        {/* Brand Logo & Desktop Category Nav */}
        <div className="flex items-center gap-3 lg:gap-6 min-w-0 shrink-0">
          {/* Redesigned Zenith Logo with zero overflow and responsive typography */}
          <ZenithLogo size="md" showSubtitle={true} className="shrink-0" />

          {/* Desktop Category Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  href={`/catalog?category=${cat.slug}`}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800/70 hover:text-cyan-400 transition-all whitespace-nowrap"
                >
                  <Icon className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>{cat.name}</span>
                </Link>
              );
            })}
            <Link
              href="/catalog"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800/70 hover:text-indigo-400 transition-all whitespace-nowrap"
            >
              <Layers className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>Catalog</span>
            </Link>
          </nav>
        </div>

        {/* Global Search Bar (Medium & Large screens) */}
        <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md mx-2 lg:mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games, apps, tools..."
              className="w-full rounded-full border border-slate-800 bg-slate-900/90 py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          </form>
        </div>

        {/* Action Controls & User Account */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Multi-Select Download Basket Button */}
          <button
            onClick={toggleDrawer}
            className="relative flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-slate-900/90 px-2.5 sm:px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-cyan-400/60 hover:bg-cyan-950/30 transition-all shadow-sm group shrink-0"
            title="Open Download Basket"
          >
            <div className="relative">
              <ShoppingBag className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-bold text-slate-950 shadow-md">
                  {itemCount}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-none">
              <span className="text-[11px] font-semibold text-slate-200 whitespace-nowrap">
                Basket {itemCount > 0 ? `(${itemCount})` : ''}
              </span>
              {itemCount > 0 && (
                <span className="text-[9px] text-cyan-400 font-mono mt-0.5">
                  {formattedTotalSize}
                </span>
              )}
            </div>
          </button>

          {/* User Profile / Auth State */}
          {session ? (
            <div className="relative shrink-0">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-1.5 pr-2.5 sm:pr-3 text-xs text-slate-200 hover:border-slate-700 transition-all"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 text-[11px] font-bold text-slate-950 uppercase shrink-0">
                  {userInitial}
                </div>
                <span className="hidden sm:inline font-semibold text-slate-200 max-w-[110px] truncate text-left">
                  {userName}
                </span>
              </button>

              {/* User Dropdown Menu */}
              {isUserDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800/80">
                    <p className="text-xs font-bold text-white truncate">{userName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{session.user?.email}</p>
                    {session.user?.role === 'ADMIN' && (
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-bold text-cyan-400 border border-cyan-500/30">
                        <Shield className="h-2.5 w-2.5" /> Platform Administrator
                      </span>
                    )}
                  </div>

                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <User className="h-3.5 w-3.5 text-cyan-400" />
                      <span>User Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard?tab=history"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <History className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Download History</span>
                    </Link>
                    <Link
                      href="/dashboard?tab=wishlist"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <Bookmark className="h-3.5 w-3.5 text-amber-400" />
                      <span>Saved Wishlist</span>
                    </Link>

                    {session.user?.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-cyan-400 bg-cyan-950/30 hover:bg-cyan-900/40 transition-colors"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        <span>Admin CMS Panel</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-800/80">
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/auth/signin"
                className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all whitespace-nowrap"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors shrink-0"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-slate-950/95 px-4 pt-3 pb-5 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games, apps, tools..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          </form>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  href={`/catalog?category=${cat.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 p-2.5 text-xs font-medium text-slate-200 hover:border-cyan-500/40"
                >
                  <Icon className="h-4 w-4 text-cyan-400" />
                  <span>{cat.name}</span>
                </Link>
              );
            })}
            <Link
              href="/catalog"
              onClick={() => setIsMobileMenuOpen(false)}
              className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-2.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-900/30"
            >
              <Layers className="h-4 w-4 text-indigo-400" />
              <span>Browse Entire Catalog</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
