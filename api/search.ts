import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface SearchQuery {
  q?: string | string[];
  count?: string | string[];
  lang?: string | string[];
}

interface SearchResult {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

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

const getQueryValue = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

const parseInteger = (value?: string) => {
  if (value === undefined || value === '') return 10;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return 10;
  return Math.min(parsed, 50);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query as SearchQuery;
  const q = getQueryValue(query.q)?.trim();
  const count = parseInteger(getQueryValue(query.count));
  const lang = getQueryValue(query.lang) || 'zh';
  const mkt = LANG_TO_MKT[lang] || 'zh-CN';

  if (!q) {
    return res.status(200).json({ code: 400, message: 'Missing required parameter: q', data: null });
  }

  try {
    const response = await axios.get('https://www.bing.com/search', {
      params: { q, count: Math.min(count, 15), mkt, format: 'rss' },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data, { xmlMode: true });
    const items: SearchResult[] = [];

    $('item').each((_, el) => {
      items.push({
        title: $(el).find('title').text(),
        link: $(el).find('link').text(),
        description: $(el).find('description').text(),
        pubDate: $(el).find('pubDate').text(),
      });
    });

    return res.status(200).json({
      code: 200,
      message: 'success',
      data: { results: items.slice(0, count), count: items.length },
    });
  } catch (error: any) {
    return res.status(200).json({
      code: error.response?.status || 500,
      message: 'Search service unavailable',
      data: null,
    });
  }
}
