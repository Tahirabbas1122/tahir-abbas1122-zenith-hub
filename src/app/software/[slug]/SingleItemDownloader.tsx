'use client';

import React, { useState } from 'react';
import { SoftwareItemData, DownloadFileData } from '@/types';
import { useDownloadBasket } from '@/context/DownloadBasketContext';
import {
  Download,
  ShoppingBag,
  Check,
  Plus,
  Monitor,
  Apple,
  HardDrive,
  Smartphone,
  Loader2,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SingleItemDownloaderProps {
  software: SoftwareItemData;
}

export function SingleItemDownloader({ software }: SingleItemDownloaderProps) {
  const { addItem, isItemInBasket, toggleItem } = useDownloadBasket();
  const files = software.downloadFiles || [];

  const [selectedFileId, setSelectedFileId] = useState<string>(
    files.find((f) => f.isPrimary)?.id || files[0]?.id || ''
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const selectedFile = files.find((f) => f.id === selectedFileId) || files[0];
  const inBasket = isItemInBasket(software.id);

  const handleDirectDownload = async () => {
    if (!selectedFile || isDownloading) return;

    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const res = await fetch('/api/downloads/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: selectedFile.id,
          softwareId: software.id,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate download URL');
      }

      const data = await res.json();
      const signedUrl = data.downloadUrl;

      // Trigger download
      const a = document.createElement('a');
      a.href = signedUrl;
      a.download = selectedFile.fileName || `${software.slug}-installer.exe`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadSuccess(true);
      try {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      } catch {}
    } catch (err) {
      console.error('Download execution error:', err);
      alert('Download link generation failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'WINDOWS':
        return <Monitor className="h-4 w-4 text-sky-400" />;
      case 'MACOS':
        return <Apple className="h-4 w-4 text-slate-300" />;
      case 'LINUX':
        return <HardDrive className="h-4 w-4 text-amber-400" />;
      case 'ANDROID':
      case 'IOS':
        return <Smartphone className="h-4 w-4 text-emerald-400" />;
      default:
        return <Download className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="rounded-2xl border border-cyan-500/40 bg-slate-950/90 p-5 space-y-4 shadow-xl shadow-cyan-950/30">
      {/* Platform Selector if multiple */}
      {files.length > 1 && (
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Select Platform Package:
          </label>
          <div className="space-y-1.5">
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => setSelectedFileId(file.id)}
                className={`w-full flex items-center justify-between rounded-xl border p-2.5 text-xs transition-all ${
                  selectedFileId === file.id
                    ? 'border-cyan-500/60 bg-cyan-500/10 text-white font-semibold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  {getPlatformIcon(file.platform)}
                  <span>{file.platform} ({file.architecture})</span>
                </div>
                <span className="font-mono text-[11px] text-cyan-400">{file.formattedSize}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected file summary */}
      {selectedFile && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Package Size:</span>
            <span className="font-mono text-cyan-400 font-bold">{selectedFile.formattedSize}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Version:</span>
            <span className="font-mono text-slate-200">{selectedFile.version}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>File Name:</span>
            <span className="font-mono text-[11px] text-slate-300 truncate max-w-[170px]">
              {selectedFile.fileName}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        {/* Direct Signed Download */}
        <button
          onClick={handleDirectDownload}
          disabled={isDownloading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-indigo-600 py-3 px-4 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500 hover:scale-[1.02] transition-all disabled:opacity-50"
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing URL & Starting...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Download Directly ({selectedFile?.formattedSize || 'Free'})</span>
            </>
          )}
        </button>

        {/* Add to Multi-Select Basket */}
        <button
          onClick={() => toggleItem(software, selectedFile)}
          className={`w-full flex items-center justify-center gap-2 rounded-xl border py-2.5 px-4 text-xs font-semibold transition-all ${
            inBasket
              ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300'
              : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-600 hover:bg-slate-800'
          }`}
        >
          {inBasket ? (
            <>
              <Check className="h-4 w-4 text-cyan-400" />
              <span>In Download Basket</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              <span>Add to Bulk Basket</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
        <Lock className="h-3 w-3 text-cyan-500" />
        <span>Expiring Signed URL • Logged to Isolated History</span>
      </div>
    </div>
  );
}
