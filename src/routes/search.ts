import type { Request, Response } from 'express';
import httpClient from '../../lib/utils/http';
import * as cheerio from 'cheerio';
import { success, error } from '../../lib/utils/response';
import { logger } from '../../lib/core/logger';
import { cache } from '../../lib/utils/cache';
import { parseInteger } from '../../lib/utils/helpers';

const LANG_TO_MKT: Record<string, string> = {
  en: 'en-US',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  pt: 'pt-BR',
  ru: 'ru-RU',
  ar: 'ar-XA',
};

export default async function searchHandler(req: Request, res: Response): Promise<void> {
  const q = (req.query.q as string)?.trim();
  const count = Math.min(parseInteger(req.query.count, 10), 50);
  const lang = (req.query.lang as string) || 'zh';
  const mkt = LANG_TO_MKT[lang] || 'zh-CN';

  if (!q) {
    res.status(200).json(error(400, 'Missing required parameter: q', null));
    return;
  }

  const cacheKey = `search:${q}:${mkt}`;
  const cached = cache.get<{
    results: { title: string; link: string; description: string; pubDate: string }[];
    count: number;
  }>(cacheKey);
  if (cached) {
    res.status(200).json(success({ results: cached.results.slice(0, count), count: cached.count }));
    return;
  }

  try {
    const response = await httpClient.get('https://www.bing.com/search', {
      params: { q, count: Math.min(count, 15), mkt, format: 'rss' },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });

    const $ = cheerio.load(response.data, { xmlMode: true });
    const items: { title: string; link: string; description: string; pubDate: string }[] = [];
    $('item').each((_, el) => {
      items.push({
        title: $(el).find('title').text(),
        link: $(el).find('link').text(),
        description: $(el).find('description').text(),
        pubDate: $(el).find('pubDate').text(),
      });
    });

    const result = { results: items, count: items.length };
    cache.set(cacheKey, result, 10 * 60 * 1000);
    res.status(200).json(success({ results: items.slice(0, count), count: items.length }));
  } catch (err) {
    logger.error('Search failed', err);
    res.status(200).json(error(503, 'Search service unavailable', null));
  }
}
