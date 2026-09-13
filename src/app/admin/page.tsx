'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Layers,
  Download,
  Users,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Loader2,
  HardDrive,
  ExternalLink,
  Activity,
  Sparkles,
  Search,
} from 'lucide-react';
import { SoftwareItemData, ReviewData, DownloadLogData, CategoryData } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'software' | 'reviews' | 'logs'>('software');
  const [stats, setStats] = useState<{
    totalSoftware: number;
    totalDownloads: number;
    totalUsers: number;
    totalReviews: number;
    categories: CategoryData[];
    recentLogs: DownloadLogData[];
    softwareList: SoftwareItemData[];
  } | null>(null);

  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State for Create / Edit Software
  const [isSoftwareModalOpen, setIsSoftwareModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SoftwareItemData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDetailedDescription, setFormDetailedDescription] = useState('');
  const [formDeveloper, setFormDeveloper] = useState('');
  const [formVersion, setFormVersion] = useState('1.0.0');
  const [formLicense, setFormLicense] = useState<'FREE' | 'OPEN_SOURCE' | 'FREEWARE' | 'TRIAL' | 'PAID'>('FREE');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formIconUrl, setFormIconUrl] = useState('');
  const [formHeroBannerUrl, setFormHeroBannerUrl] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsTrending, setFormIsTrending] = useState(false);

  // Download File Sub-form
  const [filePlatform, setFilePlatform] = useState<'WINDOWS' | 'MACOS' | 'LINUX' | 'ANDROID' | 'IOS'>('WINDOWS');
  const [fileName, setFileName] = useState('');
  const [fileSizeMB, setFileSizeMB] = useState(150);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin');
    } else if (status === 'authenticated') {
      if (session.user?.role !== 'ADMIN') {
        alert('Access denied. Administrator privileges required.');
        router.push('/');
      } else {
        loadAdminData();
      }
    }
  }, [status]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, reviewsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/reviews'),
      ]);

      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData);
        if (sData.categories?.length > 0 && !formCategoryId) {
          setFormCategoryId(sData.categories[0].id);
        }
      }

      if (reviewsRes.ok) {
        const rData = await reviewsRes.json();
        setReviews(rData);
      }
    } catch (err) {
      console.error('Error loading admin panel data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormSlug('');
    setFormTagline('');
    setFormDescription('');
    setFormDetailedDescription('');
    setFormDeveloper('Solo Studio');
    setFormVersion('1.0.0');
    setFormLicense('FREE');
    setFormIconUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&auto=format&fit=crop&q=80');
    setFormHeroBannerUrl('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80');
    setFormIsFeatured(false);
    setFormIsTrending(false);
    setFileName('AppSetup_v1.0.0.exe');
    setFileSizeMB(150);
    setIsSoftwareModalOpen(true);
  };

  const openEditModal = (item: SoftwareItemData) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormSlug(item.slug);
    setFormTagline(item.tagline);
    setFormDescription(item.description);
    setFormDetailedDescription(item.detailedDescription || '');
    setFormDeveloper(item.developer);
    setFormVersion(item.version);
    setFormLicense(item.license as unknown as 'FREE');
    setFormCategoryId(item.categoryId);
    setFormIconUrl(item.iconUrl);
    setFormHeroBannerUrl(item.heroBannerUrl || '');
    setFormIsFeatured(item.isFeatured);
    setFormIsTrending(item.isTrending);
    setIsSoftwareModalOpen(true);
  };

  const handleSoftwareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title: formTitle,
        slug: formSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-'),
        tagline: formTagline,
        description: formDescription,
        detailedDescription: formDetailedDescription,
        developer: formDeveloper,
        version: formVersion,
        license: formLicense,
        categoryId: formCategoryId,
        iconUrl: formIconUrl,
        heroBannerUrl: formHeroBannerUrl,
        isFeatured: formIsFeatured,
        isTrending: formIsTrending,
        isPublished: true,
        downloadFiles: editingItem
          ? undefined
          : [
              {
                platform: filePlatform,
                architecture: 'x64',
                version: formVersion,
                fileName: fileName || `${formSlug}_installer.exe`,
                fileSize: fileSizeMB * 1024 * 1024,
                formattedSize: `${fileSizeMB} MB`,
                storageKey: `uploads/${formSlug}/${fileName || `${formSlug}_installer.exe`}`,
                isPrimary: true,
              },
            ],
      };

      const url = editingItem
        ? `/api/admin/software/${editingItem.id}`
        : '/api/admin/software';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save software item');
      }

      setIsSoftwareModalOpen(false);
      await loadAdminData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      alert(`Error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSoftware = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/software/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await loadAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete item');
    }
  };

  const handleToggleReviewStatus = async (reviewId: string, currentApproved: boolean) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, isApproved: !currentApproved }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, isApproved: !currentApproved } : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${reviewId}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-3" />
        <p className="text-xs">Loading Admin CMS Panel...</p>
      </div>
    );
  }

  const filteredSoftware = (stats?.softwareList || []).filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.developer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 pb-24">
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-white tracking-tight">
            <Shield className="h-6 w-6 text-cyan-400" />
            <span>Zenith Solo-Developer CMS Panel</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage catalog software items, direct file packages, categories, and user reviews.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Software</span>
        </button>
      </div>

      {/* Platform Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Catalog Items</span>
            <Layers className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{stats?.totalSoftware || 0}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Downloads</span>
            <Download className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-cyan-400 font-mono">{stats?.totalDownloads || 0}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Registered Users</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{stats?.totalUsers || 0}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Reviews Count</span>
            <MessageSquare className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">{stats?.totalReviews || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('software')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === 'software'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Software Catalog ({stats?.softwareList?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === 'reviews'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Moderate Reviews ({reviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === 'logs'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Live Download Logs</span>
        </button>
      </div>

      {/* Tab: Software Management */}
      {activeTab === 'software' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-sm flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search catalog items..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-4 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Item</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">License</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Downloads</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredSoftware.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/80 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={item.iconUrl}
                        alt={item.title}
                        className="h-9 w-9 rounded-lg object-cover border border-slate-800"
                      />
                      <div>
                        <span className="font-bold text-white block">{item.title}</span>
                        <span className="text-[10px] text-slate-500">v{item.version} • {item.developer}</span>
                      </div>
                    </td>
                    <td className="p-4 text-cyan-400 font-medium">{item.category?.name}</td>
                    <td className="p-4">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                        {item.license}
                      </span>
                    </td>
                    <td className="p-4 text-amber-400 font-semibold font-mono">
                      ⭐ {item.averageRating.toFixed(1)}
                    </td>
                    <td className="p-4 font-mono text-slate-300">{item.downloadCount}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:text-cyan-400"
                        title="Edit Software"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSoftware(item.id, item.title)}
                        className="rounded-lg border border-rose-900/50 bg-rose-950/30 p-1.5 text-rose-400 hover:bg-rose-900/40"
                        title="Delete Software"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Reviews Moderation */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden divide-y divide-slate-800">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{rev.user?.name}</span>
                    <span className="text-[10px] text-slate-500">on</span>
                    <span className="text-cyan-400 font-semibold text-xs">{rev.software?.title}</span>
                    <span className="text-amber-400 text-xs font-mono">⭐ {rev.rating}/5</span>
                  </div>
                  <h5 className="text-xs font-semibold text-slate-300">{rev.title}</h5>
                  <p className="text-xs text-slate-400">{rev.comment}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleReviewStatus(rev.id, rev.isApproved)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                      rev.isApproved
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {rev.isApproved ? 'Approved' : 'Pending'}
                  </button>
                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="rounded-xl border border-rose-900/50 bg-rose-950/30 p-2 text-rose-400 hover:bg-rose-900/40"
                    title="Delete review"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Live Download Activity Logs */}
      {activeTab === 'logs' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Software</th>
                <th className="p-4">File Package</th>
                <th className="p-4">Platform</th>
                <th className="p-4">User</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {(stats?.recentLogs || []).map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/80">
                  <td className="p-4 text-slate-500">{formatDate(log.createdAt)}</td>
                  <td className="p-4 font-sans font-semibold text-white">{log.software?.title}</td>
                  <td className="p-4 text-slate-300">{log.downloadFile?.fileName}</td>
                  <td className="p-4 text-cyan-400 uppercase">{log.platform}</td>
                  <td className="p-4 text-slate-400">{log.user?.email || 'Guest Visitor'}</td>
                  <td className="p-4">
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-400 border border-emerald-500/30">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Software Create/Edit Modal */}
      {isSoftwareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingItem ? 'Edit Software Item' : 'Add New Software to Catalog'}
              </h3>
              <button
                onClick={() => setIsSoftwareModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSoftwareSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => {
                      setFormTitle(e.target.value);
                      if (!editingItem) {
                        setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                      }
                    }}
                    placeholder="e.g. CyberVanguard Pro"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="e.g. cybervanguard-pro"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tagline (One-liner summary)</label>
                <input
                  type="text"
                  required
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  placeholder="e.g. High performance tactical space shooter with offline mode."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    {stats?.categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Developer</label>
                  <input
                    type="text"
                    required
                    value={formDeveloper}
                    onChange={(e) => setFormDeveloper(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">License</label>
                  <select
                    value={formLicense}
                    onChange={(e) => setFormLicense(e.target.value as 'FREE')}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="FREE">Free</option>
                    <option value="OPEN_SOURCE">Open Source</option>
                    <option value="FREEWARE">Freeware</option>
                    <option value="TRIAL">Free Trial</option>
                    <option value="PAID">Commercial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Short Description</label>
                <textarea
                  rows={2}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Icon URL</label>
                <input
                  type="url"
                  required
                  value={formIconUrl}
                  onChange={(e) => setFormIconUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {!editingItem && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                  <h4 className="font-bold text-white text-xs">Primary Download Package</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Platform</label>
                      <select
                        value={filePlatform}
                        onChange={(e) => setFilePlatform(e.target.value as 'WINDOWS')}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200"
                      >
                        <option value="WINDOWS">Windows (exe)</option>
                        <option value="MACOS">macOS (dmg)</option>
                        <option value="LINUX">Linux (tar.gz/AppImage)</option>
                        <option value="ANDROID">Android (apk)</option>
                        <option value="IOS">iOS (ipa)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">File Name</label>
                      <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="Setup.exe"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Size (MB)</label>
                      <input
                        type="number"
                        value={fileSizeMB}
                        onChange={(e) => setFileSizeMB(parseInt(e.target.value, 10) || 100)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSoftwareModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save to Catalog'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
