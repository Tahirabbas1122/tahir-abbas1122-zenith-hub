import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

// Initialize S3/R2 client if credentials are configured
const isR2Configured = Boolean(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME
);

const isAWSConfigured = Boolean(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_BUCKET_NAME
);

let s3Client: S3Client | null = null;
let bucketName = process.env.R2_BUCKET_NAME || process.env.AWS_BUCKET_NAME || 'zenith-hub-storage';

if (isR2Configured) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
} else if (isAWSConfigured) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

/**
 * Generates a signed, expiring download URL for a given storage key or file.
 * In development/demo mode (or when S3 is not yet connected), it generates a secure HMAC-signed
 * local gateway URL that streams the file safely.
 */
export async function generateSignedDownloadUrl(params: {
  storageKey: string;
  fileName: string;
  fileId: string;
  expiresInSeconds?: number;
  userId?: string | null;
}): Promise<{ url: string; expiresAt: Date; provider: 'r2' | 's3' | 'signed_gateway' }> {
  const expiresIn = params.expiresInSeconds || parseInt(process.env.DOWNLOAD_URL_EXPIRY_SECONDS || '1800', 10);
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  // If cloud storage client is available and active
  if (s3Client && process.env.STORAGE_PROVIDER !== 'mock') {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: params.storageKey,
        ResponseContentDisposition: `attachment; filename="${encodeURIComponent(params.fileName)}"`,
      });

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
      return {
        url: signedUrl,
        expiresAt,
        provider: isR2Configured ? 'r2' : 's3',
      };
    } catch (err) {
      console.warn('⚠️ Cloud storage presign failed, falling back to secure local signed gateway:', err);
    }
  }

  // Secure local signed gateway URL (HMAC token)
  const secret = process.env.NEXTAUTH_SECRET || 'zenith-default-signing-key-production';
  const expiryTimestamp = Math.floor(expiresAt.getTime() / 1000);
  const payload = `${params.fileId}:${expiryTimestamp}:${params.fileName}`;
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/downloads/serve/${params.fileId}?exp=${expiryTimestamp}&fn=${encodeURIComponent(params.fileName)}&sig=${hmac}`;

  return {
    url,
    expiresAt,
    provider: 'signed_gateway',
  };
}

/**
 * Validates a signed gateway download token
 */
export function verifySignedDownloadToken(params: {
  fileId: string;
  fileName: string;
  expiryTimestamp: number;
  signature: string;
}): boolean {
  const nowTimestamp = Math.floor(Date.now() / 1000);
  if (params.expiryTimestamp < nowTimestamp) {
    return false; // Token expired
  }

  const secret = process.env.NEXTAUTH_SECRET || 'zenith-default-signing-key-production';
  const payload = `${params.fileId}:${params.expiryTimestamp}:${params.fileName}`;
  const expectedHmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(params.signature), Buffer.from(expectedHmac));
  } catch {
    return false;
  }
}
