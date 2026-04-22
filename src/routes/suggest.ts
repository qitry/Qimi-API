import type { Request, Response } from 'express';
import httpClient from '../../lib/utils/http';
import { success, error } from '../../lib/utils/response';
import { logger } from '../../lib/core/logger';
import { cache } from '../../lib/utils/cache';

const BAIDU_SUGGEST_URL = 'https://suggestion.baidu.com/su';

export default async function suggestHandler(req: Request, res: Response): Promise<void> {
  const q = req.query.q;

  if (!q || typeof q !== 'string') {
    res.status(200).json(error(400, 'Missing required parameter: q', null));
    return;
  }

  const cacheKey = `suggest:${q}`;
  const cached = cache.get<{ query: string; suggestions: string[] }>(cacheKey);
  if (cached) {
    res.status(200).json(success(cached));
    return;
  }

  try {
    const response = await httpClient.get(BAIDU_SUGGEST_URL, {
      params: { wd: q, action: 'opensearch' },
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
      responseType: 'arraybuffer',
    });
    const decoder = new TextDecoder('gbk');
    const data = JSON.parse(decoder.decode(response.data));
    if (Array.isArray(data) && Array.isArray(data[1])) {
      const result = { query: data[0], suggestions: data[1] };
      cache.set(cacheKey, result, 5 * 60 * 1000);
      res.status(200).json(success(result));
      return;
    }
    const result = { query: q, suggestions: [] as string[] };
    cache.set(cacheKey, result, 5 * 60 * 1000);
    res.status(200).json(success(result));
  } catch (err) {
    logger.error('Suggest failed', err);
    res.status(200).json(error(503, 'Suggestion service unavailable', null));
  }
}
