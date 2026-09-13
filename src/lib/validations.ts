import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const reviewSchema = z.object({
  softwareId: z.string().min(1, 'Software ID is required'),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  comment: z.string().min(10, 'Review comment must be at least 10 characters').max(2000),
});

export const downloadSignSchema = z.object({
  fileId: z.string().min(1, 'File ID is required'),
  softwareId: z.string().min(1, 'Software ID is required'),
});

export const batchDownloadSignSchema = z.object({
  items: z.array(
    z.object({
      fileId: z.string().min(1),
      softwareId: z.string().min(1),
    })
  ).min(1, 'At least one item required for batch download'),
});

export const softwareItemSchema = z.object({
  title: z.string().min(2, 'Title is required').max(100),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  tagline: z.string().min(5, 'Tagline is required').max(180),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  detailedDescription: z.string().optional(),
  developer: z.string().min(2, 'Developer is required'),
  publisher: z.string().optional(),
  version: z.string().default('1.0.0'),
  license: z.enum(['FREE', 'OPEN_SOURCE', 'FREEWARE', 'TRIAL', 'PAID']).default('FREE'),
  categoryId: z.string().min(1, 'Category is required'),
  iconUrl: z.string().url('Valid icon URL is required'),
  heroBannerUrl: z.string().url().optional().or(z.literal('')),
  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isTopRated: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  downloadFiles: z.array(
    z.object({
      platform: z.enum(['WINDOWS', 'MACOS', 'LINUX', 'ANDROID', 'IOS']),
      architecture: z.string().default('x64'),
      version: z.string().default('1.0.0'),
      fileName: z.string().min(1),
      fileSize: z.number().positive(),
      formattedSize: z.string().min(1),
      fileHash: z.string().optional(),
      storageKey: z.string().min(1),
      isPrimary: z.boolean().default(false),
    })
  ).optional().default([]),
  systemRequirements: z.array(
    z.object({
      platform: z.enum(['WINDOWS', 'MACOS', 'LINUX', 'ANDROID', 'IOS']).default('WINDOWS'),
      reqType: z.enum(['MINIMUM', 'RECOMMENDED']).default('MINIMUM'),
      os: z.string().min(1),
      processor: z.string().min(1),
      memory: z.string().min(1),
      graphics: z.string().min(1),
      storage: z.string().min(1),
      directX: z.string().optional(),
      network: z.string().optional(),
      additionalNotes: z.string().optional(),
    })
  ).optional().default([]),
});

export const searchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  platform: z.string().optional(),
  license: z.string().optional(),
  tag: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxSizeMB: z.coerce.number().positive().optional(),
  sort: z.enum(['popular', 'newest', 'rating', 'name', 'size']).optional().default('popular'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(12),
});
