// TypeScript Types & Interfaces for Zenith Software Hub

export type Role = 'USER' | 'ADMIN';
export type PlatformType = 'WINDOWS' | 'MACOS' | 'LINUX' | 'ANDROID' | 'IOS';
export type LicenseType = 'FREE' | 'OPEN_SOURCE' | 'FREEWARE' | 'TRIAL' | 'PAID';
export type ReqType = 'MINIMUM' | 'RECOMMENDED';

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  orderIndex: number;
  _count?: {
    items: number;
  };
}

export interface TagData {
  id: string;
  name: string;
  slug: string;
}

export interface ScreenshotData {
  id: string;
  url: string;
  caption: string | null;
  orderIndex: number;
}

export interface DownloadFileData {
  id: string;
  softwareId: string;
  platform: string;
  architecture: string;
  version: string;
  fileName: string;
  fileSize: number | bigint;
  formattedSize: string;
  fileHash?: string | null;
  storageKey: string;
  downloadCount: number;
  isPrimary: boolean;
}

export interface SystemRequirementData {
  id: string;
  softwareId: string;
  platform: string;
  reqType: string;
  os: string;
  processor: string;
  memory: string;
  graphics: string;
  storage: string;
  directX?: string | null;
  network?: string | null;
  additionalNotes?: string | null;
}

export interface ReviewData {
  id: string;
  softwareId: string;
  software?: {
    id: string;
    title: string;
    slug: string;
  };
  userId: string;
  user: {
    id: string;
    name: string | null;
    email?: string | null;
    image: string | null;
  };
  rating: number;
  title: string;
  comment: string;
  isVerifiedDownload: boolean;
  isApproved: boolean;
  helpfulVotes: number;
  createdAt: string | Date;
}

export interface SoftwareItemData {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  detailedDescription?: string | null;
  developer: string;
  publisher?: string | null;
  releaseDate: string | Date;
  version: string;
  license: string;
  isFeatured: boolean;
  isTrending: boolean;
  isTopRated: boolean;
  isPublished: boolean;
  downloadCount: number;
  viewCount: number;
  averageRating: number;
  ratingCount: number;
  iconUrl: string;
  heroBannerUrl?: string | null;
  categoryId: string;
  category?: CategoryData;
  tags?: {
    tag: TagData;
  }[];
  screenshots?: ScreenshotData[];
  downloadFiles?: DownloadFileData[];
  systemRequirements?: SystemRequirementData[];
  reviews?: ReviewData[];
  isSaved?: boolean;
}

// Basket Item for Multi-Select Bulk Downloads
export interface BasketItem {
  id: string; // softwareId
  title: string;
  slug: string;
  iconUrl: string;
  categoryName: string;
  categorySlug: string;
  selectedFile: DownloadFileData;
  status?: 'idle' | 'signing' | 'downloading' | 'completed' | 'error';
  progress?: number;
  downloadUrl?: string;
  errorMessage?: string;
}

// Download Log for Isolated History
export interface DownloadLogData {
  id: string;
  userId: string | null;
  user?: {
    name: string | null;
    email: string | null;
  } | null;
  softwareId: string;
  software: {
    id: string;
    title: string;
    slug: string;
    iconUrl: string;
    category: {
      name: string;
      slug: string;
    };
  };
  fileId: string;
  downloadFile: DownloadFileData;
  platform: string;
  status: string;
  createdAt: string | Date;
}

// AI Chatbot Message
export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string | Date;
  suggestedItems?: SoftwareItemData[];
}
