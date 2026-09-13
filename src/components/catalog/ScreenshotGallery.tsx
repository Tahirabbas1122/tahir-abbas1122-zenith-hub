'use client';

import React, { useState } from 'react';
import { ScreenshotData } from '@/types';
import { ChevronLeft, ChevronRight, X, Maximize2, Image as ImageIcon } from 'lucide-react';

interface ScreenshotGalleryProps {
  screenshots: ScreenshotData[];
  title: string;
}

export function ScreenshotGallery({ screenshots, title }: ScreenshotGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!screenshots || screenshots.length === 0) {
    return null;
  }

  const currentScreenshot = screenshots[selectedIndex];

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % screenshots.length);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  return (
    <div className="space-y-3">
      {/* Featured Main Preview */}
      <div className="relative group overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 aspect-[16/9] shadow-2xl">
        <img
          src={currentScreenshot.url}
          alt={currentScreenshot.caption || `${title} screenshot`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Caption Overlay */}
        {currentScreenshot.caption && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-4 pt-10">
            <p className="text-xs font-medium text-slate-200">{currentScreenshot.caption}</p>
          </div>
        )}

        {/* Expand / Lightbox Trigger */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute top-3 right-3 rounded-xl border border-slate-700 bg-slate-950/80 p-2 text-slate-300 opacity-0 group-hover:opacity-100 backdrop-blur-md hover:text-cyan-400 transition-all"
          title="Fullscreen preview"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* Carousel Prev/Next Buttons */}
        {screenshots.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-slate-700 bg-slate-950/80 p-2 text-slate-300 opacity-0 group-hover:opacity-100 backdrop-blur-md hover:bg-cyan-600 hover:text-slate-950 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-slate-700 bg-slate-950/80 p-2 text-slate-300 opacity-0 group-hover:opacity-100 backdrop-blur-md hover:bg-cyan-600 hover:text-slate-950 transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {screenshots.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
          {screenshots.map((s, idx) => (
            <button
              key={s.id || idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-xl border transition-all ${
                selectedIndex === idx
                  ? 'border-cyan-400 ring-2 ring-cyan-500/30'
                  : 'border-slate-800 opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={s.url}
                alt={s.caption || `Thumbnail ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 rounded-full bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentScreenshot.url}
              alt={currentScreenshot.caption || 'Preview'}
              className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl border border-slate-800"
            />
            {currentScreenshot.caption && (
              <p className="mt-3 text-sm text-slate-300 text-center font-medium">
                {currentScreenshot.caption}
              </p>
            )}

            {screenshots.length > 1 && (
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={handlePrev}
                  className="rounded-full bg-slate-800 p-2 text-slate-200 hover:bg-cyan-600 hover:text-slate-950"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedIndex + 1} / {screenshots.length}
                </span>
                <button
                  onClick={handleNext}
                  className="rounded-full bg-slate-800 p-2 text-slate-200 hover:bg-cyan-600 hover:text-slate-950"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
