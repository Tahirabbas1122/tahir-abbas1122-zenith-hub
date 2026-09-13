// In-Memory Sliding Window Rate Limiter for Solo-Developer Scalability
// Designed to comfortably support 1000+ concurrent users with zero external infra dependencies

interface RateLimitRecord {
  timestamps: number[];
}

const tracker = new Map<string, RateLimitRecord>();

// Cleanup stale rate limit records every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of tracker.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 300000);
      if (record.timestamps.length === 0) {
        tracker.delete(key);
      }
    }
  }, 300000);
}

export interface RateLimitOptions {
  limit?: number;
  windowMs?: number;
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
} {
  const limit = options.limit || 60; // Max requests
  const windowMs = options.windowMs || 60000; // 1 minute window
  const now = Date.now();

  const record = tracker.get(identifier) || { timestamps: [] };
  // Filter out timestamps outside window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0];
    const resetTime = oldestTimestamp + windowMs;
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.ceil((resetTime - now) / 1000),
    };
  }

  record.timestamps.push(now);
  tracker.set(identifier, record);

  return {
    success: true,
    limit,
    remaining: limit - record.timestamps.length,
    reset: Math.ceil(windowMs / 1000),
  };
}
