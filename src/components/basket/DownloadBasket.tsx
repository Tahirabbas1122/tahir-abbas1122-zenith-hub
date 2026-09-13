'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Download,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  HardDrive,
} from 'lucide-react';
import { useDownloadBasket } from '@/context/DownloadBasketContext';

export function DownloadBasket() {
  const {
    items,
    itemCount,
    formattedTotalSize,
    isDrawerOpen,
    isDownloadingAll,
    activeDownloadItem,
    downloadProgress,
    removeItem,
    clearBasket,
    openDrawer,
    closeDrawer,
    startSequentialBulkDownload,
  } = useDownloadBasket();

  if (itemCount === 0 && !isDrawerOpen) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Dock (Visible when basket has items and drawer is closed) */}
      {!isDrawerOpen && itemCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/40 bg-slate-950/90 p-2.5 pl-4 shadow-2xl shadow-cyan-950/50 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-500/20">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 text-xs font-bold text-slate-950">
                  {itemCount}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Download Basket</span>
                <span className="text-[11px] font-mono text-cyan-400">{formattedTotalSize} total</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={openDrawer}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Review Items
              </button>
              <button
                onClick={startSequentialBulkDownload}
                disabled={isDownloadingAll}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all disabled:opacity-50"
              >
                {isDownloadingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download All</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Drawer / Modal */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Bulk Download Basket</h3>
                  <p className="text-[11px] text-slate-400">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} • <span className="text-cyan-400 font-mono">{formattedTotalSize}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={closeDrawer}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Active Download Sequential Progress Bar */}
            {isDownloadingAll && (
              <div className="p-4 bg-cyan-950/40 border-b border-cyan-500/30">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-cyan-300 flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Downloading {downloadProgress.current} of {downloadProgress.total}
                  </span>
                  <span className="font-mono text-cyan-400">{downloadProgress.percent}%</span>
                </div>
                {activeDownloadItem && (
                  <p className="text-[11px] text-slate-300 truncate mb-2">
                    Active: <span className="text-white font-semibold">{activeDownloadItem}</span>
                  </p>
                )}
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
                    style={{ width: `${downloadProgress.percent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <ShoppingBag className="h-12 w-12 text-slate-600 mb-3" />
                  <p className="font-medium text-slate-300">Your basket is empty</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Select checkboxes on games and software across the catalog to download them all at once.
                  </p>
                  <Link
                    href="/catalog"
                    onClick={closeDrawer}
                    className="mt-4 flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-500"
                  >
                    Browse Catalog <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={item.iconUrl}
                        alt={item.title}
                        className="h-10 w-10 rounded-lg object-cover border border-slate-800 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="text-cyan-400">{item.categoryName}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-300">{item.selectedFile.formattedSize}</span>
                          <span>•</span>
                          <span className="uppercase text-slate-400">{item.selectedFile.platform}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Delete */}
                    <div className="flex items-center gap-2">
                      {item.status === 'completed' && (
                        <span title="Downloaded">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </span>
                      )}
                      {item.status === 'signing' && (
                        <span title="Signing URL...">
                          <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span title={item.errorMessage || 'Error'}>
                          <AlertCircle className="h-4 w-4 text-rose-400" />
                        </span>
                      )}
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={isDownloadingAll}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-rose-400 transition-colors disabled:opacity-30"
                        title="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer Actions */}
            {items.length > 0 && (
              <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Download Payload:</span>
                  <span className="font-mono font-bold text-white text-sm">{formattedTotalSize}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={clearBasket}
                    disabled={isDownloadingAll}
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-900 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    Clear Basket
                  </button>

                  <button
                    onClick={startSequentialBulkDownload}
                    disabled={isDownloadingAll}
                    className="flex-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-2.5 px-4 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all disabled:opacity-50"
                  >
                    {isDownloadingAll ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing Queue...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Download All ({itemCount})</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-center text-slate-500">
                  ⚡ All downloads are signed, rate-limited, and automatically logged to your history.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
