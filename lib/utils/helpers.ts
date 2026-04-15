import type { VercelRequest } from '@vercel/node';

export function getClientIp(
  req: VercelRequest | { headers: Record<string, unknown>; socket: { remoteAddress?: string } }
): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return ips.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

export function parseQuery(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value) && value.length > 0) {
    return String(value[0]);
  }
  return undefined;
}

export function parseInteger(value: unknown, defaultValue = 0): number {
  if (value === undefined || value === '') {
    return defaultValue;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : defaultValue;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
