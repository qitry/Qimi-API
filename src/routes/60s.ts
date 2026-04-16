import type { Request, Response } from 'express';
import axios from 'axios';
import { success } from '../../lib/utils/response';
import { logger } from '../../lib/core/logger';

const SIXTY_CACHE: { data?: string[]; timestamp?: number } = {};
const SIXTY_CACHE_DURATION = 60 * 60 * 1000;

export default async function sixtyHandler(req: Request, res: Response): Promise<void> {
  const now = Date.now();

  if (
    SIXTY_CACHE.data &&
    SIXTY_CACHE.timestamp &&
    now - SIXTY_CACHE.timestamp < SIXTY_CACHE_DURATION
  ) {
    res.status(200).json(success(SIXTY_CACHE.data));
    return;
  }

  try {
    const response = await axios.get('https://cdn.lylme.com/api/60s/', {
      timeout: 10000,
      headers: { 'User-Agent': 'qimiapi/1.0' },
    });
    if (response.data?.status === 200 && response.data?.data) {
      SIXTY_CACHE.data = response.data.data;
      SIXTY_CACHE.timestamp = now;
      res.status(200).json(success(response.data.data));
      return;
    }
  } catch (err) {
    logger.error('60s failed', err);
  }

  res.status(200).json(success(SIXTY_CACHE.data || []));
}
