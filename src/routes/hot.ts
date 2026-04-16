import type { Request, Response } from 'express';
import axios from 'axios';
import { success } from '../../lib/utils/response';
import { logger } from '../../lib/core/logger';

const HOT_CACHE: { data?: unknown[]; timestamp?: number } = {};
const HOT_CACHE_DURATION = 30 * 60 * 1000;

export default async function hotHandler(req: Request, res: Response): Promise<void> {
  const { type } = req.query;
  const now = Date.now();

  if (HOT_CACHE.data && HOT_CACHE.timestamp && now - HOT_CACHE.timestamp < HOT_CACHE_DURATION) {
    const data = HOT_CACHE.data as { name: string; alias: string; data: unknown[] }[];
    if (type && typeof type === 'string') {
      const filtered = data.filter(s => s.alias === type);
      res.status(200).json(filtered.length > 0 ? success(filtered[0].data) : success(data));
      return;
    }
    res.status(200).json(success(data));
    return;
  }

  try {
    const response = await axios.get('https://cdn.lylme.com/api/hot/', {
      timeout: 10000,
      headers: { 'User-Agent': 'qimiapi/1.0' },
    });
    if (response.data?.code === 200 && response.data?.data) {
      HOT_CACHE.data = response.data.data;
      HOT_CACHE.timestamp = now;
      res.status(200).json(success(response.data.data));
      return;
    }
  } catch (err) {
    logger.error('Hot failed', err);
  }

  res.status(200).json(success(HOT_CACHE.data || []));
}
