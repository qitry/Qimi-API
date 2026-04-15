import type { VercelRequest, VercelResponse } from '@vercel/node';
import { rateLimit } from '../lib/core/rateLimit';
import { logger } from '../lib/core/logger';
import { getErrorResponse, RateLimitError } from '../lib/core/error';
import { success, error } from '../lib/utils/response';
import { parseQuery, parseInteger, getClientIp } from '../lib/utils/helpers';

const globalRateLimiter = rateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 80 });

interface Handler {
  (req: VercelRequest, res: VercelResponse): Promise<void>;
}

const handlers: Record<string, Handler> = {};

function registerHandler(path: string, handler: Handler): void {
  handlers[path] = handler;
}

registerHandler('weather', async (req: VercelRequest, res: VercelResponse) => {
  const axios = (await import('axios')).default;

  const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
  const IP_API_BASE_URL = 'https://ip-api.com/json/';

  const { latitude, longitude, ip, ...rest } = req.query;
  let lat = parseQuery(latitude);
  let lon = parseQuery(longitude);

  if (!lat || !lon) {
    const clientIp = ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ipStr = Array.isArray(clientIp) ? clientIp[0] : clientIp;

    try {
      const ipRes = await axios.get(
        `${IP_API_BASE_URL}${ipStr === '::1' || ipStr === '127.0.0.1' ? '' : ipStr}`,
      );
      const ipData = ipRes.data;

      if (ipData.status === 'success') {
        lat = ipData.lat;
        lon = ipData.lon;
        res.setHeader('X-Location-City', ipData.city || '');
      } else {
        res.status(200).json(error(400, 'IP 定位失败', null));
        return;
      }
    } catch (err) {
      logger.error('Weather IP lookup failed', err);
      res.status(200).json(error(500, '定位服务不可用', null));
      return;
    }
  }

  try {
    const response = await axios.get(OPEN_METEO_BASE_URL, {
      params: { latitude: lat, longitude: lon, current_weather: true, ...rest },
    });

    res.status(200).json(
      success({
        ...response.data,
        location: { lat, lon },
      }),
    );
  } catch (err) {
    logger.error('Weather API failed', err);
    res.status(200).json(error(503, 'Weather service unavailable', null));
  }
});

registerHandler('ip', async (req: VercelRequest, res: VercelResponse) => {
  const axios = (await import('axios')).default;

  const IP_API_BASE_URL = 'https://ip-api.com/json/';
  const { query = '', lang = 'zh-CN', ...rest } = req.query;

  try {
    const response = await axios.get(`${IP_API_BASE_URL}${query}`, {
      params: {
        lang,
        ...rest,
        fields:
          rest.fields ||
          'status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query',
      },
    });

    if (response.data.status === 'fail') {
      res.status(200).json(error(400, 'Query failed', response.data));
      return;
    }

    res.status(200).json(success(response.data));
  } catch (err) {
    logger.error('IP lookup failed', err);
    res.status(200).json(error(500, 'IP lookup failed', null));
  }
});

registerHandler('search', async (req: VercelRequest, res: VercelResponse) => {
  const axios = (await import('axios')).default;
  const cheerio = await import('cheerio');

  interface SearchResult {
    title: string;
    link: string;
    description: string;
    pubDate: string;
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

  const q = parseQuery(req.query.q)?.trim();
  const count = Math.min(parseInteger(req.query.count, 10), 50);
  const lang = parseQuery(req.query.lang) || 'zh';
  const mkt = LANG_TO_MKT[lang] || 'zh-CN';

  if (!q) {
    res.status(200).json(error(400, 'Missing required parameter: q', null));
    return;
  }

  try {
    const response = await axios.get('https://www.bing.com/search', {
      params: { q, count: Math.min(count, 15), mkt, format: 'rss' },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml',
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

    res.status(200).json(success({ results: items.slice(0, count), count: items.length }));
  } catch (err) {
    logger.error('Search failed', err);
    res.status(200).json(error(503, 'Search service unavailable', null));
  }
});

registerHandler('history', async (req: VercelRequest, res: VercelResponse) => {
  const axios = (await import('axios')).default;

  const { query = '', year, month } = req.query;

  let url = 'https://raw.githubusercontent.com/liucccc/liuexp-data/main/history.json';
  if (year && month) {
    url = `https://raw.githubusercontent.com/liucccc/liuexp-data/main/history/${year}/${month}.json`;
  }

  try {
    const response = await axios.get(url);
    let data = response.data;

    if (typeof data === 'string') {
      data = JSON.parse(data);
    }

    if (query && typeof data === 'object' && !Array.isArray(data)) {
      data = Object.values(data).flat();
    }

    res.status(200).json(success(data));
  } catch (err) {
    logger.error('History data unavailable', err);
    res.status(200).json(error(503, 'History data unavailable', null));
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!globalRateLimiter(req, res)) {
    const rateLimitError = new RateLimitError('Too many requests, please try again later.');
    res.status(429).json(error(429, rateLimitError.message, { ip: getClientIp(req) }));
    return;
  }

  const urlPath = req.url || '';
  const path = urlPath.replace(/^\/api\//, '').split('?')[0];
  const handler = handlers[path];

  if (!handler) {
    res.status(404).json(error(404, `Route not found: ${req.method} /api/${path}`, null));
    return;
  }

  try {
    await handler(req, res);
  } catch (err) {
    logger.error(`Handler ${path} failed`, err);
    const { code, message } = getErrorResponse(err);
    res.status(200).json(error(code, message, null));
  }
}

export { registerHandler, handlers };
