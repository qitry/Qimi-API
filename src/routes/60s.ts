import type { Request, Response } from 'express';
import httpClient from '../../lib/utils/http';
import { success } from '../../lib/utils/response';
import { logger } from '../../lib/core/logger';
import { cache } from '../../lib/utils/cache';

const SIXTY_API = 'https://cdn.lylme.com/api/60s/';
const CACHE_TTL = 60 * 60 * 1000;

export default async function sixtyHandler(req: Request, res: Response): Promise<void> {
  const cacheKey = '60s';
  const cached = cache.get<string[]>(cacheKey);
  if (cached) {
    res.status(200).json(success(cached));
    return;
  }

  try {
    const response = await httpClient.get(SIXTY_API, {
      headers: { 'User-Agent': 'qimiapi/1.0' },
    });
    if (response.data?.status === 200 && response.data?.data) {
      cache.set(cacheKey, response.data.data, CACHE_TTL);
      res.status(200).json(success(response.data.data));
      return;
    }
  } catch (err) {
    logger.error('60s failed', err);
  }

  const stale = cache.get<string[]>(cacheKey);
  res.status(200).json(success(stale || []));
}
