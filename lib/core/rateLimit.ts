import type { Request, Response } from 'express';
import { getClientIp } from '../utils/helpers';
import type { RateLimitConfig } from '../types';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 60 * 1000,
  maxRequests: 80,
};

const store = new Map<string, RateLimitStore>();

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (value.resetTime <= now) {
      store.delete(key);
    }
  }
}, 60 * 1000);

export function rateLimit(
  config: Partial<RateLimitConfig> = {},
): (req: Request, res: Response, next: () => void) => void {
  const { windowMs, maxRequests } = { ...defaultConfig, ...config };

  return (req: Request, res: Response, next: () => void): void => {
    const ip = getClientIp(req);
    const now = Date.now();
    const key = `rate_limit:${ip}`;

    let record = store.get(key);

    if (!record || record.resetTime <= now) {
      record = {
        count: 0,
        resetTime: now + windowMs,
      };
      store.set(key, record);
    }

    record.count++;

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.status(429).json({
        code: 429,
        message: 'Too many requests, please try again later.',
        data: { ip },
      });
      return;
    }

    next();
  };
}

export function getRateLimitStatus(ip: string): { count: number; resetTime: number } | null {
  const key = `rate_limit:${ip}`;
  const record = store.get(key);
  if (record && record.resetTime > Date.now()) {
    return { count: record.count, resetTime: record.resetTime };
  }
  return null;
}
