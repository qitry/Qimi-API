import type { Request, Response } from 'express';
import httpClient from '../../../lib/utils/http';
import { success, error } from '../../../lib/utils/response';
import { logger } from '../../../lib/core/logger';
import { cache } from '../../../lib/utils/cache';
import { parseInteger } from '../../../lib/utils/helpers';

const BING_API = 'https://cn.bing.com/HPImageArchive.aspx';
const CACHE_TTL = 60 * 60 * 1000;

interface BingImage {
  title: string;
  copyright: string;
  desc: string;
  url: string;
  url_base: string;
  enddate: string;
}

export default async function bingHandler(req: Request, res: Response): Promise<void> {
  const n = Math.max(1, Math.min(parseInteger(req.query.n, 1), 8));
  const idx = Math.max(0, Math.min(parseInteger(req.query.idx, 0), 7));

  const cacheKey = `bing:${idx}:${n}`;
  const cached = cache.get<{ date: string; images: BingImage[] }>(cacheKey);
  if (cached) {
    res.status(200).json(success(cached));
    return;
  }

  try {
    const response = await httpClient.get(BING_API, {
      params: { format: 'js', idx, n, mkt: 'zh-CN' },
    });

    const data = response.data;
    if (!data?.images) {
      res.status(200).json(error(503, 'Bing wallpaper data unavailable', null));
      return;
    }

    const images: BingImage[] = data.images.map(
      (img: { title?: string; copyright?: string; copyrightlink?: string; url?: string; urlbase?: string; enddate?: string; desc?: string }) => ({
        title: img.title || '',
        copyright: img.copyright || '',
        desc: img.copyright || '',
        url: `https://cn.bing.com${img.url}`,
        url_base: `https://cn.bing.com${img.urlbase}`,
        enddate: img.enddate || '',
      }),
    );

    const result = { date: images[0]?.enddate || '', images };
    cache.set(cacheKey, result, CACHE_TTL);
    res.status(200).json(success(result));
  } catch (err) {
    logger.error('Bing wallpaper failed', err);
    res.status(200).json(error(503, 'Bing wallpaper service unavailable', null));
  }
}
