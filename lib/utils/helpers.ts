import type { Request } from 'express';

export function getClientIp(req: Request): string {
  return req.ip || 'unknown';
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
