import type { Request } from 'express';

function normalizeIp(ip: string): string {
  if (ip.startsWith('::ffff:')) return ip.slice(7);
  return ip;
}

function isReservedIp(ip: string): boolean {
  if (!ip) return true;
  return (
    ip === '::1' ||
    ip === '127.0.0.1' ||
    ip === '0.0.0.0' ||
    ip === '::' ||
    ip.startsWith('127.') ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
    ip.startsWith('fc') ||
    ip.startsWith('fd') ||
    ip === 'unknown'
  );
}

function extractFirstPublicIp(header: string): string | null {
  const ips = header.split(',').map(s => normalizeIp(s.trim()));
  return ips.find(ip => !isReservedIp(ip)) || null;
}

export function getClientIp(req: Request): string {
  const proxyHeaders = [
    'cf-connecting-ip',
    'true-client-ip',
    'x-real-ip',
    'x-forwarded-for',
  ];

  for (const header of proxyHeaders) {
    const value = req.headers[header] as string | undefined;
    if (value) {
      const ip = extractFirstPublicIp(value);
      if (ip) return ip;
    }
  }

  const ip = normalizeIp(req.ip || '');
  if (!isReservedIp(ip)) return ip;

  return 'unknown';
}

export { normalizeIp, isReservedIp };

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
