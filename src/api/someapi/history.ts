import type { Request, Response } from 'express';
import path from 'path';
import { success, error } from '../../../lib/utils/response';
import { logger } from '../../../lib/core/logger';
import { cache } from '../../../lib/utils/cache';
import type { HistoryEvent } from '../../types/history';

const monthDataCache = new Map<string, unknown>();

async function getMonthData(monthStr: string): Promise<Record<string, HistoryEvent[]> | null> {
  if (monthDataCache.has(monthStr)) {
    return monthDataCache.get(monthStr) as Record<string, HistoryEvent[]>;
  }

  const { readFileSync } = await import('fs');
  try {
    const filePath = path.join(process.cwd(), 'history_today', `${monthStr}.json`);
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    monthDataCache.set(monthStr, data);
    return data;
  } catch {
    return null;
  }
}

export default async function historyHandler(req: Request, res: Response): Promise<void> {
  const { month, day } = req.query;
  const now = new Date();
  const m = month || String(now.getMonth() + 1);
  const d = day || String(now.getDate());
  const monthStr = String(m).padStart(2, '0');
  const dayStr = String(d).padStart(2, '0');
  const dateKey = `${monthStr}${dayStr}`;

  const cached = cache.get<unknown[]>(`history:${dateKey}`);
  if (cached) {
    res.status(200).json(success(cached));
    return;
  }

  try {
    const data = await getMonthData(monthStr);
    if (!data) {
      res.status(200).json(error(503, 'History data unavailable', null));
      return;
    }

    const monthData = (data as Record<string, unknown>)[monthStr];
    const events = (monthData as Record<string, HistoryEvent[]>)?.[dateKey] || [];

    if (events.length === 0) {
      cache.set(`history:${dateKey}`, [], 60 * 60 * 1000);
      res.status(200).json(success([]));
      return;
    }

    const result = events
      .map((event: HistoryEvent) => ({
        year: event.year.trim(),
        title: event.title.trim(),
        desc: event.desc.trim(),
        link: event.link,
        date: dateKey,
        type: event.type || '',
        festival: event.festival || '',
      }))
      .slice(0, 50);

    cache.set(`history:${dateKey}`, result, 60 * 60 * 1000);
    res.status(200).json(success(result));
  } catch (err) {
    logger.error('History failed', err);
    res.status(200).json(error(503, 'History data unavailable', null));
  }
}
