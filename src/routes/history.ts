import type { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { success, error } from '../../lib/utils/response';
import { logger } from '../../lib/core/logger';
import type { HistoryEvent } from '../types/history';

export default async function historyHandler(req: Request, res: Response): Promise<void> {
  const { month, day } = req.query;

  const now = new Date();
  const m = month || String(now.getMonth() + 1);
  const d = day || String(now.getDate());
  const monthStr = String(m).padStart(2, '0');
  const dayStr = String(d).padStart(2, '0');

  try {
    const filePath = path.join(process.cwd(), 'history_today', `${monthStr}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    const dateKey = `${monthStr}${dayStr}`;
    const events = data[monthStr]?.[dateKey] || [];

    if (events.length === 0) {
      res.status(200).json(success([]));
      return;
    }

    const result = events.map((event: HistoryEvent) => ({
      year: event.year.trim(),
      title: event.title.trim(),
      desc: event.desc.trim(),
      link: event.link,
      date: dateKey,
      type: event.type || '',
      festival: event.festival || '',
    }));

    res.status(200).json(success(result.slice(0, 50)));
  } catch (err) {
    logger.error('History failed', err);
    res.status(200).json(error(503, 'History data unavailable', null));
  }
}
