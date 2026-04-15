import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface SearchResult {
  title: string;
  link: string;
  description: string;
  date: string;
}

const BAIDU_SEARCH_URL = 'https://www.baidu.com/s';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { q, count = '10' } = req.query;

  if (!q || typeof q !== 'string') {
    return res
      .status(200)
      .json({ code: 400, message: 'Missing required parameter: q', data: null });
  }

  const num = Math.min(parseInt(count as string) || 10, 20);

  try {
    const response = await axios.get(BAIDU_SEARCH_URL, {
      params: { wd: q, rn: num, ie: 'utf-8', inputT: Math.floor(Date.now() / 1000) },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'Referer': 'https://www.baidu.com/',
        'Cookie': `BDUSS=${Buffer.from(Date.now().toString()).toString('base64').substring(0, 32)}; PSTM=${Date.now()}`,
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    if ($('title').text().includes('安全验证') || $('body').text().includes('百度安全验证')) {
      return res.status(200).json({
        code: 503,
        message: 'Baidu security check triggered, try again later',
        data: null,
      });
    }

    const results: SearchResult[] = [];

    $('div.result, div.c-result, div.result-op').each((_, el) => {
      const $el = $(el);
      const title =
        $el.find('h3.c-title a, h3 a, .c-title a, a.c-title').text().trim() ||
        $el.find('h3').first().text().trim() ||
        $el
          .find('a')
          .filter((_, a) => $(a).text().length > 10)
          .first()
          .text()
          .trim();

      let link = $el.find('h3.c-title a, h3 a, .c-title a, a.c-title').attr('href') || '';

      if (!link || link.includes('baidu.com/link')) {
        const dataUrl = $el.find('[data-url]').attr('data-url');
        if (dataUrl) link = dataUrl;
      }

      const description =
        $el.find('.c-abstract, .c-span-last span, span[data-content], p').first().text().trim() ||
        $el
          .find('*')
          .filter((_, el) => $(el).text().length > 50 && $(el).text().length < 300)
          .first()
          .text()
          .trim() ||
        '';

      const dateMatch = $el.text().match(/\d{4}年\d{1,2}月\d{1,2}日|(\d{4}-\d{2}-\d{2})/);
      const date = dateMatch ? dateMatch[0] : '';

      if (title && (link || description)) {
        results.push({
          title: title.substring(0, 200),
          link: link || '',
          description: description.substring(0, 300),
          date,
        });
      }
    });

    if (results.length === 0) {
      $('a[href*="http"]').each((_, el) => {
        const $el = $(el);
        const href = $el.attr('href') || '';
        const text = $el.text().trim();
        if (
          href.startsWith('http') &&
          text.length > 10 &&
          !href.includes('baidu.com') &&
          !href.includes('baidubce.com')
        ) {
          const container = $el.parent().parent();
          const desc = container
            .find('p, span')
            .filter((_, el) => $(el).text().length > 20 && $(el).text().length < 200)
            .first()
            .text()
            .trim();
          if (results.length < num) {
            results.push({
              title: text.substring(0, 200),
              link: href,
              description: desc || '',
              date: '',
            });
          }
        }
      });
    }

    return res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        query: q,
        results: results.slice(0, num),
        count: results.length,
        source: 'baidu',
        status: 'alpha',
      },
    });
  } catch (error: any) {
    return res.status(200).json({
      code: error.response?.status || 500,
      message: 'Search service unavailable',
      data: null,
    });
  }
}
