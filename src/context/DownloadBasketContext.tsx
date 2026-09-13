'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { BasketItem, DownloadFileData, SoftwareItemData } from '@/types';
import { formatBytes } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface DownloadBasketContextType {
  items: BasketItem[];
  itemCount: number;
  totalSizeBytes: number;
  formattedTotalSize: string;
  isDrawerOpen: boolean;
  isDownloadingAll: boolean;
  activeDownloadItem: string | null;
  downloadProgress: { current: number; total: number; percent: number };
  addItem: (software: SoftwareItemData, chosenFile?: DownloadFileData) => void;
  removeItem: (softwareId: string) => void;
  toggleItem: (software: SoftwareItemData, chosenFile?: DownloadFileData) => void;
  clearBasket: () => void;
  isItemInBasket: (softwareId: string) => boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  startSequentialBulkDownload: () => Promise<void>;
}

const DownloadBasketContext = createContext<DownloadBasketContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'zenith_download_basket_v1';

export function DownloadBasketProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [activeDownloadItem, setActiveDownloadItem] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0, percent: 0 });

  // Load basket from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load basket from localStorage', e);
    }
  }, []);

  // Sync basket to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save basket to localStorage', e);
    }
  }, [items]);

  const totalSizeBytes = useMemo(() => {
    return items.reduce((acc, item) => {
      const size = typeof item.selectedFile.fileSize === 'bigint'
        ? Number(item.selectedFile.fileSize)
        : Number(item.selectedFile.fileSize || 0);
      return acc + size;
    }, 0);
  }, [items]);

  const formattedTotalSize = useMemo(() => {
    return formatBytes(totalSizeBytes);
  }, [totalSizeBytes]);

  const isItemInBasket = useCallback(
    (softwareId: string) => items.some((item) => item.id === softwareId),
    [items]
  );

  const addItem = useCallback(
    (software: SoftwareItemData, chosenFile?: DownloadFileData) => {
      setItems((prev) => {
        if (prev.some((i) => i.id === software.id)) return prev;

        const fileToUse =
          chosenFile ||
          software.downloadFiles?.find((f) => f.isPrimary) ||
          software.downloadFiles?.[0] || {
            id: `temp-${software.id}`,
            softwareId: software.id,
            platform: 'WINDOWS',
            architecture: 'x64',
            version: software.version,
            fileName: `${software.slug}_v${software.version}.exe`,
            fileSize: 100000000,
            formattedSize: '100 MB',
            storageKey: `software/${software.slug}`,
            downloadCount: 0,
            isPrimary: true,
          };

        const newItem: BasketItem = {
          id: software.id,
          title: software.title,
          slug: software.slug,
          iconUrl: software.iconUrl,
          categoryName: software.category?.name || 'Software',
          categorySlug: software.category?.slug || 'software',
          selectedFile: fileToUse,
          status: 'idle',
          progress: 0,
        };

        return [...prev, newItem];
      });
    },
    []
  );

  const removeItem = useCallback((softwareId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== softwareId));
  }, []);

  const toggleItem = useCallback(
    (software: SoftwareItemData, chosenFile?: DownloadFileData) => {
      if (isItemInBasket(software.id)) {
        removeItem(software.id);
      } else {
        addItem(software, chosenFile);
      }
    },
    [isItemInBasket, removeItem, addItem]
  );

  const clearBasket = useCallback(() => {
    setItems([]);
  }, []);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  // Sequential Bulk Downloader
  const startSequentialBulkDownload = useCallback(async () => {
    if (items.length === 0 || isDownloadingAll) return;

    setIsDownloadingAll(true);
    setDownloadProgress({ current: 0, total: items.length, percent: 0 });

    try {
      // Trigger celebratory micro-interaction
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore in SSR / unsupported environments
    }

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      setActiveDownloadItem(item.title);

      // Update progress
      setDownloadProgress({
        current: index + 1,
        total: items.length,
        percent: Math.round(((index + 1) / items.length) * 100),
      });

      // Update item status in state
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'signing', progress: 20 } : it))
      );

      try {
        // Request signed expiring download URL
        const res = await fetch('/api/downloads/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileId: item.selectedFile.id,
            softwareId: item.id,
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to sign download URL');
        }

        const data = await res.json();
        const signedUrl = data.downloadUrl;

        // Update item progress
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? { ...it, status: 'downloading', downloadUrl: signedUrl, progress: 70 }
              : it
          )
        );

        // Trigger browser download via invisible anchor tag
        const link = document.createElement('a');
        link.href = signedUrl;
        link.download = item.selectedFile.fileName || `${item.slug}-installer.exe`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Mark completed
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'completed', progress: 100 } : it))
        );

        // Brief delay between downloads to prevent browser multi-download blocking
        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Download failed';
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: 'error', errorMessage: errorMsg } : it
          )
        );
      }
    }

    setIsDownloadingAll(false);
    setActiveDownloadItem(null);
  }, [items, isDownloadingAll]);

  return (
    <DownloadBasketContext.Provider
      value={{
        items,
        itemCount: items.length,
        totalSizeBytes,
        formattedTotalSize,
        isDrawerOpen,
        isDownloadingAll,
        activeDownloadItem,
        downloadProgress,
        addItem,
        removeItem,
        toggleItem,
        clearBasket,
        isItemInBasket,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        startSequentialBulkDownload,
      }}
    >
      {children}
    </DownloadBasketContext.Provider>
  );
}

export function useDownloadBasket() {
  const context = useContext(DownloadBasketContext);
  if (!context) {
    throw new Error('useDownloadBasket must be used within a DownloadBasketProvider');
  }
  return context;
}
