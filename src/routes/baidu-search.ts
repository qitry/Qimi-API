import type { Request, Response } from 'express';
import httpClient from '../../lib/utils/http';
import * as cheerio from 'cheerio';
import { success, error } from '../../lib/utils/response';
import { logger } from '../../lib/core/logger';
import { cache } from '../../lib/utils/cache';
import { parseInteger } from '../../lib/utils/helpers';

const BAIDU_SEARCH_URL = 'https://www.baidu.com/s';

export default async function baiduSearchHandler(req: Request, res: Response): Promise<void> {
  const { q, count = '10' } = req.query;

  if (!q || typeof q !== 'string') {
    res.status(200).json(error(400, 'Missing required parameter: q', null));
    return;
  }

  const num = Math.min(parseInteger(count, 10), 20);

  const cacheKey = `baidu-search:${q}:${num}`;
  const cached = cache.get<{
    query: string;
    results: { title: string; link: string; description: string; date: string }[];
    count: number;
    source: string;
    status: string;
  }>(cacheKey);
  if (cached) {
    res.status(200).json(success(cached));
    return;
  }

  try {
    const response = await httpClient.get(BAIDU_SEARCH_URL, {
      params: { wd: q, rn: num, ie: 'utf-8', inputT: Math.floor(Date.now() / 1000) },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    if ($('title').text().includes('安全验证')) {
      res.status(200).json(error(503, 'Baidu security check triggered, try again later', null));
      return;
    }

    const results: { title: string; link: string; description: string; date: string }[] = [];
    $('div.result, div.c-result, div.result-op').each((_, el) => {
      const $el = $(el);
      const title = $el.find('h3').first().text().trim() || '';
      const link = $el.find('h3 a').attr('href') || '';
      const description = $el.find('.c-abstract, p').first().text().trim() || '';
      if (title && (link || description)) {
        results.push({ title, link, description: description.substring(0, 300), date: '' });
      }
    });

    const result = {
      query: q,
      results: results.slice(0, num),
      count: results.length,
      source: 'baidu',
      status: 'alpha',
    };
    cache.set(cacheKey, result, 10 * 60 * 1000);
    res.status(200).json(success(result));
  } catch (err) {
    logger.error('Baidu search failed', err);
    res.status(200).json(error(503, 'Search service unavailable', null));
  }
}
