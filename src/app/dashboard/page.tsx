'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  History,
  Bookmark,
  User,
  Shield,
  Download,
  Calendar,
  Layers,
  ArrowRight,
  Loader2,
  Trash2,
  Lock,
  HardDrive,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';
import { DownloadLogData, SoftwareItemData } from '@/types';
import { useDownloadBasket } from '@/context/DownloadBasketContext';
import { formatDate } from '@/lib/utils';

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useDownloadBasket();

  const [activeTab, setActiveTab] = useState<'history' | 'wishlist' | 'profile'>(
    (searchParams.get('tab') as 'history' | 'wishlist' | 'profile') || 'history'
  );

  const [historyLogs, setHistoryLogs] = useState<DownloadLogData[]>([]);
  const [wishlistItems, setWishlistItems] = useState<{ id: string; software: SoftwareItemData }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard');
    } else if (status === 'authenticated') {
      loadUserData();
    }
  }, [status]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const [histRes, wishRes] = await Promise.all([
        fetch('/api/user/history'),
        fetch('/api/wishlist'),
      ]);

      if (histRes.ok) {
        const histData = await histRes.json();
        setHistoryLogs(histData);
      }

      if (wishRes.ok) {
        const wishData = await wishRes.json();
        setWishlistItems(wishData);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedownload = async (fileId: string, softwareId: string, fileName: string) => {
    try {
      const res = await fetch('/api/downloads/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, softwareId }),
      });

      if (!res.ok) throw new Error('Failed to sign URL');

      const data = await res.json();
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Re-download error:', err);
      alert('Failed to initiate re-download.');
    }
  };

  const handleExportData = () => {
    const exportPayload = {
      user: {
        id: session?.user?.id,
        name: session?.user?.name,
        email: session?.user?.email,
        role: session?.user?.role,
      },
      exportTimestamp: new Date().toISOString(),
      downloadHistory: historyLogs,
      savedWishlist: wishlistItems,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zenith-user-data-${session?.user?.id || 'export'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-3" />
        <p className="text-xs">Loading your isolated user dashboard...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 pb-20">
      {/* Profile Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-xl font-bold text-white uppercase shadow-lg shadow-cyan-500/20">
            {session?.user?.name?.[0] || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{session?.user?.name}</h1>
              {session?.user?.role === 'ADMIN' ? (
                <span className="inline-flex items-center gap-1 rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/30">
                  <Shield className="h-3 w-3" /> Admin Operator
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-700">
                  Verified Member
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{session?.user?.email}</p>
          </div>
        </div>

        {/* GDPR Export Button */}
        <button
          onClick={handleExportData}
          className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:border-cyan-500 hover:text-cyan-300 transition-colors self-start sm:self-auto"
        >
          Export Personal Data (JSON)
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === 'history'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <History className="h-4 w-4" />
          <span>Isolated Download History ({historyLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === 'wishlist'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Bookmark className="h-4 w-4" />
          <span>Saved Wishlist ({wishlistItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === 'profile'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Security & Isolation</span>
        </button>
      </div>

      {/* Tab: Isolated Download History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Your Download Log (Postgres RLS Enforced)</h3>
            <span className="text-xs text-slate-500 font-mono">Row-Level Security Active</span>
          </div>

          {historyLogs.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400 space-y-3">
              <History className="h-10 w-10 text-slate-600 mx-auto" />
              <h4 className="font-bold text-sm text-slate-200">No downloads logged yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Items downloaded from the catalog or bulk download basket will appear here in your isolated history.
              </p>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-1 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-500"
              >
                Explore Catalog <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden divide-y divide-slate-800">
              {historyLogs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/80 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={log.software.iconUrl}
                      alt={log.software.title}
                      className="h-12 w-12 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                    />
                    <div>
                      <Link
                        href={`/software/${log.software.slug}`}
                        className="font-bold text-sm text-white hover:text-cyan-400 transition-colors"
                      >
                        {log.software.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="text-cyan-400">{log.software.category.name}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-300">{log.downloadFile?.formattedSize || 'N/A'}</span>
                        <span>•</span>
                        <span className="uppercase text-slate-400">{log.platform}</span>
                        <span>•</span>
                        <span className="text-slate-500">{formatDate(log.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleRedownload(
                        log.fileId,
                        log.softwareId,
                        log.downloadFile?.fileName || `${log.software.slug}.bin`
                      )
                    }
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all self-start sm:self-auto"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Re-download</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Saved Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Your Saved Items</h3>

          {wishlistItems.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400 space-y-3">
              <Bookmark className="h-10 w-10 text-slate-600 mx-auto" />
              <h4 className="font-bold text-sm text-slate-200">Your wishlist is empty</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click the bookmark icon on any game or software item in the catalog to save it for later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item) => (
                <div key={item.id} className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between space-y-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={item.software.iconUrl}
                      alt={item.software.title}
                      className="h-12 w-12 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/software/${item.software.slug}`}
                        className="font-bold text-sm text-white hover:text-cyan-400 transition-colors truncate block"
                      >
                        {item.software.title}
                      </Link>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {item.software.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <Link
                      href={`/software/${item.software.slug}`}
                      className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      View Details <ExternalLink className="h-3 w-3" />
                    </Link>
                    <button
                      onClick={() => addItem(item.software)}
                      className="flex items-center gap-1 rounded-xl bg-cyan-600 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-500 transition-colors"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" /> Add to Basket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Profile & Security Architecture */}
      {activeTab === 'profile' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="h-5 w-5 text-cyan-400" /> Multi-Tenant Isolation Guarantee
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Zenith Software Hub utilizes single-database multi-tenant isolation with PostgreSQL Row-Level Security (RLS). Every download history record, saved item, and review is scoped by your unique User ID (<code className="text-cyan-400 font-mono text-[11px]">{session?.user?.id}</code>).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-1">
              <span className="text-slate-400 block">Database Isolation</span>
              <span className="text-emerald-400 font-semibold">Postgres RLS Policy Active</span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-1">
              <span className="text-slate-400 block">Download Delivery</span>
              <span className="text-cyan-400 font-semibold">Expiring Signed URLs</span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-1">
              <span className="text-slate-400 block">Account Role</span>
              <span className="text-indigo-400 font-semibold font-mono">{session?.user?.role}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
