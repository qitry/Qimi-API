import type { VercelRequest, VercelResponse } from '@vercel/node';
import { rateLimit } from '../lib/core/rateLimit';
import { logger } from '../lib/core/logger';
import { getErrorResponse, RateLimitError } from '../lib/core/error';
import { success, error } from '../lib/utils/response';
import { parseQuery, parseInteger, getClientIp } from '../lib/utils/helpers';
import { Solar } from 'lunar-javascript';

const globalRateLimiter = rateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 80 });

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void>;
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
      const ipRes = await axios.get(`${IP_API_BASE_URL}${ipStr === '::1' || ipStr === '127.0.0.1' ? '' : ipStr}`);
      if (ipRes.data.status === 'success') {
        lat = ipRes.data.lat;
        lon = ipRes.data.lon;
        res.setHeader('X-Location-City', ipRes.data.city || '');
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
    res.status(200).json(success({ ...response.data, location: { lat, lon } }));
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
        fields: rest.fields || 'status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query',
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

  const LANG_TO_MKT: Record<string, string> = {
    en: 'en-US', zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR',
    fr: 'fr-FR', de: 'de-DE', es: 'es-ES', pt: 'pt-BR', ru: 'ru-RU', ar: 'ar-XA',
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
      timeout: 10000,
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
    res.status(200).json(success({ results: items.slice(0, count), count: items.length }));
  } catch (err) {
    logger.error('Search failed', err);
    res.status(200).json(error(503, 'Search service unavailable', null));
  }
});

registerHandler('baidu', async (req: VercelRequest, res: VercelResponse) => {
  const axios = (await import('axios')).default;
  const BAIDU_HOT_API = 'https://zj.v.api.aa1.cn/api/baidu-rs/';

  try {
    const response = await axios.get(BAIDU_HOT_API, { timeout: 10000 });
    if (response.data.code !== 1) {
      res.status(200).json(error(500, 'Hot list unavailable', null));
      return;
    }
    const items = response.data.data.map((item: Record<string, unknown>) => ({
      index: item.index,
      title: item.title,
      hot: item.hot,
      desc: item.desc || '',
      image: item.pic || '',
      url: item.url,
    }));
    res.status(200).json(success(items));
  } catch (err) {
    logger.error('Baidu hot failed', err);
    res.status(200).json(error(500, 'Hot list unavailable', null));
  }
});

registerHandler('bilibili', async (req: VercelRequest, res: VercelResponse) => {
  const axios = (await import('axios')).default;
  const BILIBILI_API = 'https://api.bilibili.com/x/web-interface/ranking/v2';

  try {
    const response = await axios.get(BILIBILI_API, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 10000,
    });
    if (response.data.code !== 0) {
      res.status(200).json(error(500, 'Hot list unavailable', null));
      return;
    }
    const list = response.data.data.list.map((item: Record<string, unknown>, index: number) => ({
      rank: index + 1,
      aid: item.aid,
      bvid: item.bvid,
      title: item.title,
      url: `https://www.bilibili.com/video/${item.bvid}`,
      cover: item.pic,
      author: (item.owner as Record<string, unknown>)?.name,
      authorFace: (item.owner as Record<string, unknown>)?.face,
      view: (item.stat as Record<string, unknown>)?.view,
      like: (item.stat as Record<string, unknown>)?.like,
      reply: (item.stat as Record<string, unknown>)?.reply,
      favorite: (item.stat as Record<string, unknown>)?.favorite,
      coin: (item.stat as Record<string, unknown>)?.coin,
      duration: item.duration,
      pubdate: item.pubdate,
    }));
    res.status(200).json(success(list));
  } catch (err) {
    logger.error('Bilibili failed', err);
    res.status(200).json(error(500, 'Hot list unavailable', null));
  }
});

registerHandler('history', async (req: VercelRequest, res: VercelResponse) => {
  const axios = (await import('axios')).default;
  const { month, day } = req.query;

  const now = new Date();
  const m = month || String(now.getMonth() + 1);
  const d = day || String(now.getDate());
  const monthStr = String(m).padStart(2, '0');

  try {
    const url = `https://cdn.lylme.com/api/history/${monthStr}.json`;
    const response = await axios.get(url, { timeout: 10000 });
    const monthData = response.data?.[monthStr];
    if (!monthData) {
      res.status(200).json(success([]));
      return;
    }
    const dayKey = monthStr + String(d).padStart(2, '0');
    const dayData = monthData[dayKey];
    if (!dayData || !Array.isArray(dayData)) {
      res.status(200).json(success([]));
      return;
    }
    const result = dayData.map((item: Record<string, unknown>) => ({
      year: item.year,
      title: String(item.title || '').replace(/<[^>]*>/g, ''),
      desc: String(item.desc || '').replace(/<[^>]*>/g, ''),
      link: item.link || '',
      date: dayKey,
    }));
    res.status(200).json(success(result));
  } catch (err) {
    logger.error('History failed', err);
    res.status(200).json(error(503, 'History data unavailable', null));
  }
});

registerHandler('suggest', async (req: VercelRequest, res: VercelResponse) => {
  const axios = (await import('axios')).default;
  const BAIDU_SUGGEST_URL = 'https://suggestion.baidu.com/su';
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    res.status(200).json(error(400, 'Missing required parameter: q', null));
    return;
  }

  try {
    const response = await axios.get(BAIDU_SUGGEST_URL, {
      params: { wd: q, action: 'opensearch' },
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
      responseType: 'arraybuffer',
      timeout: 10000,
    });
    const decoder = new TextDecoder('gbk');
    const data = JSON.parse(decoder.decode(response.data));
    if (Array.isArray(data) && Array.isArray(data[1])) {
      res.status(200).json(success({ query: data[0], suggestions: data[1] }));
      return;
    }
    res.status(200).json(success({ query: q, suggestions: [] }));
  } catch (err) {
    logger.error('Suggest failed', err);
    res.status(200).json(error(503, 'Suggestion service unavailable', null));
  }
});

registerHandler('baidu-search', async (req: VercelRequest, res: VercelResponse) => {
  const axios = (await import('axios')).default;
  const cheerio = await import('cheerio');
  const BAIDU_SEARCH_URL = 'https://www.baidu.com/s';
  const { q, count = '10' } = req.query;

  if (!q || typeof q !== 'string') {
    res.status(200).json(error(400, 'Missing required parameter: q', null));
    return;
  }

  const num = Math.min(parseInt(count as string) || 10, 20);

  try {
    const response = await axios.get(BAIDU_SEARCH_URL, {
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

    res.status(200).json(success({
      query: q,
      results: results.slice(0, num),
      count: results.length,
      source: 'baidu',
      status: 'alpha',
    }));
  } catch (err) {
    logger.error('Baidu search failed', err);
    res.status(200).json(error(503, 'Search service unavailable', null));
  }
});

const LUNAR_CACHE: { data?: unknown; timestamp?: number } = {};
const LUNAR_CACHE_DURATION = 60 * 60 * 1000;

registerHandler('lunar', async (req: VercelRequest, res: VercelResponse) => {
  const axios = (await import('axios')).default;
  const FESTIVAL_API = 'https://festival2.wifilu.com/';
  const FORTUNE_API = 'https://api.suyanw.cn/api/huangli.php';
  const { date } = req.query;

  const now = Date.now();
  if (LUNAR_CACHE.data && LUNAR_CACHE.timestamp && now - LUNAR_CACHE.timestamp < LUNAR_CACHE_DURATION) {
    res.status(200).json(success(LUNAR_CACHE.data));
    return;
  }

  try {
    const targetDate = date ? String(date) : undefined;
    const festivalUrl = targetDate ? `${FESTIVAL_API}?date=${targetDate}&type=calendar` : `${FESTIVAL_API}?type=calendar`;

    const solar = (() => {
      if (targetDate) {
        const parts = targetDate.split('-');
        if (parts.length === 3) return Solar.fromYmd(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
      }
      return Solar.fromDate(new Date());
    })();

    const lunar = solar.getLunar();
    const [festivalRes, fortuneRes] = await Promise.allSettled([
      axios.get(festivalUrl, { timeout: 10000 }),
      axios.get(FORTUNE_API, { timeout: 10000 }),
    ]);

    const festival = festivalRes.status === 'fulfilled' ? festivalRes.value.data : null;
    const fortune = fortuneRes.status === 'fulfilled' ? fortuneRes.value.data : null;

    const result = {
      date: solar.toString(),
      solar: { year: solar.getYear(), month: solar.getMonth(), day: solar.getDay(), weekday: solar.getWeekInChinese() },
      lunar: {
        year: lunar.getYear(), month: lunar.getMonth(), day: lunar.getDay(),
        monthName: lunar.getMonthInChinese(), dayName: lunar.getDayInChinese(),
        isLeapMonth: lunar.isLeapMonth(),
        yearShengXiao: lunar.getYearShengXiao(),
      },
      ganzhi: {
        year: lunar.getYearInGanZhi(),
        month: lunar.getMonthInGanZhi(),
        day: lunar.getDayInGanZhi(),
        hour: lunar.getHourInGanZhi(),
      },
      yi: lunar.getDayYi(),
      ji: lunar.getDayJi(),
      chong: { description: lunar.getChongDesc(), sha: lunar.getSha() },
      pengZu: { gan: lunar.getPengZuGan(), zhi: lunar.getPengZuZhi() },
      festivals: {
        lunar: festival?.festival_lunar || '',
        solar: festival?.festival_solar || '',
        solarTerm: festival?.solar_term || lunar.getJieQi(),
      },
      fortune: fortune?.星座运势 || null,
    };

    LUNAR_CACHE.data = result;
    LUNAR_CACHE.timestamp = now;
    res.status(200).json(success(result));
  } catch (err) {
    logger.error('Lunar failed', err);
    res.status(200).json(error(503, 'Lunar calendar service unavailable', null));
  }
});

const SIXTY_CACHE: { data?: string[]; timestamp?: number } = {};
const SIXTY_CACHE_DURATION = 60 * 60 * 1000;

registerHandler('60s', async (req: VercelRequest, res: VercelResponse) => {
  const axios = (await import('axios')).default;
  const now = Date.now();

  if (SIXTY_CACHE.data && SIXTY_CACHE.timestamp && now - SIXTY_CACHE.timestamp < SIXTY_CACHE_DURATION) {
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
});

const HOT_CACHE: { data?: unknown[]; timestamp?: number } = {};
const HOT_CACHE_DURATION = 30 * 60 * 1000;

registerHandler('hot', async (req: VercelRequest, res: VercelResponse) => {
  const axios = (await import('axios')).default;
  const { type } = req.query;
  const now = Date.now();

  if (HOT_CACHE.data && HOT_CACHE.timestamp && now - HOT_CACHE.timestamp < HOT_CACHE_DURATION) {
    const data = HOT_CACHE.data as { name: string; alias: string; data: unknown[] }[];
    if (type && typeof type === 'string') {
      const filtered = data.filter((s) => s.alias === type);
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
