import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number | bigint, decimals = 1): string {
  const numBytes = typeof bytes === 'bigint' ? Number(bytes) : bytes;
  if (numBytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(numBytes) / Math.log(k));
  return `${parseFloat((numBytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateStringOrDate: string | Date): string {
  const date = new Date(dateStringOrDate);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDownloadCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toString();
}

export function getLicenseBadge(license: string): { label: string; color: string } {
  switch (license) {
    case 'OPEN_SOURCE':
      return { label: 'Open Source', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    case 'FREE':
      return { label: 'Free', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
    case 'FREEWARE':
      return { label: 'Freeware', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
    case 'TRIAL':
      return { label: 'Free Trial', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    case 'PAID':
      return { label: 'Commercial', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
    default:
      return { label: license, color: 'bg-slate-500/10 text-slate-400 border-slate-500/30' };
  }
}
