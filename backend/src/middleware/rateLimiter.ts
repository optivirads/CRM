import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

interface RateLimiterOptions {
  windowMs: number;   // time window in milliseconds
  maxRequests: number; // max requests per window
  message?: string;
}

/**
 * Creates a sliding-window rate limiter middleware.
 * Used as a secondary defense on top of DB-level lockout.
 * For production, replace with Redis-backed rate limiter.
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const { windowMs, maxRequests, message = 'Too many requests. Please try again later.' } = options;
  const store = new Map<string, RateLimitEntry>();

  // Clean up old entries every 10 minutes to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now - entry.windowStart > windowMs * 2) {
        store.delete(key);
      }
    }
  }, 10 * 60 * 1000);

  // Prevent the interval from keeping the Node process alive
  if (cleanupInterval.unref) cleanupInterval.unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    // Get real IP — works behind Render/Vercel/Nginx proxies with trust proxy set
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      'unknown';

    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now - entry.windowStart > windowMs) {
      // New window
      store.set(ip, { count: 1, windowStart: now });
      next();
      return;
    }

    entry.count += 1;

    if (entry.count > maxRequests) {
      const retryAfterSec = Math.ceil((windowMs - (now - entry.windowStart)) / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: retryAfterSec
      });
      return;
    }

    next();
  };
}

// Pre-built limiters for common use cases
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  message: 'Too many login attempts from this IP. Please wait 15 minutes before trying again.'
});

export const integrationTestRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 15,
  message: 'Too many integration test requests. Please wait before testing again.'
});
