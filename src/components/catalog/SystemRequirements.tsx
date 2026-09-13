'use client';

import React, { useState } from 'react';
import { SystemRequirementData } from '@/types';
import { Cpu, HardDrive, Monitor, Layers, Shield, Wifi, Terminal } from 'lucide-react';

interface SystemRequirementsProps {
  requirements: SystemRequirementData[];
}

export function SystemRequirements({ requirements }: SystemRequirementsProps) {
  if (!requirements || requirements.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center text-xs text-slate-400">
        Standard modern operating system supported. No special hardware requirements specified.
      </div>
    );
  }

  // Get available platforms in requirements
  const platforms = Array.from(new Set(requirements.map((r) => r.platform)));
  const [activePlatform, setActivePlatform] = useState(platforms[0]);

  const platformReqs = requirements.filter((r) => r.platform === activePlatform);
  const minReq = platformReqs.find((r) => r.reqType === 'MINIMUM') || platformReqs[0];
  const recReq = platformReqs.find((r) => r.reqType === 'RECOMMENDED');

  return (
    <div className="space-y-4">
      {/* Platform Switcher if multiple */}
      {platforms.length > 1 && (
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setActivePlatform(p)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                activePlatform === p
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Minimum Specs */}
        {minReq && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Terminal className="h-4 w-4" /> Minimum Requirements
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <Monitor className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Operating System</span>
                  <span className="text-slate-200 font-medium">{minReq.os}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Cpu className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Processor</span>
                  <span className="text-slate-200 font-medium">{minReq.processor}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Layers className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Memory</span>
                  <span className="text-slate-200 font-medium">{minReq.memory}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Shield className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Graphics</span>
                  <span className="text-slate-200 font-medium">{minReq.graphics}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <HardDrive className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Storage</span>
                  <span className="text-slate-200 font-medium">{minReq.storage}</span>
                </div>
              </div>
              {minReq.network && (
                <div className="flex items-start gap-2.5">
                  <Wifi className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Network</span>
                    <span className="text-slate-200 font-medium">{minReq.network}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommended Specs */}
        {recReq ? (
          <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-5 space-y-3 shadow-lg shadow-cyan-950/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Terminal className="h-4 w-4" /> Recommended Specs
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <Monitor className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Operating System</span>
                  <span className="text-slate-200 font-medium">{recReq.os}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Cpu className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Processor</span>
                  <span className="text-slate-200 font-medium">{recReq.processor}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Layers className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Memory</span>
                  <span className="text-slate-200 font-medium">{recReq.memory}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Shield className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Graphics</span>
                  <span className="text-slate-200 font-medium">{recReq.graphics}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <HardDrive className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Storage</span>
                  <span className="text-slate-200 font-medium">{recReq.storage}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5 flex flex-col items-center justify-center text-center text-xs text-slate-500">
            <Cpu className="h-8 w-8 text-slate-700 mb-2" />
            <p>Will run smoothly on all hardware meeting the minimum baseline specification.</p>
          </div>
        )}
      </div>
    </div>
  );
}
