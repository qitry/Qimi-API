import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const BAIDU_SUGGEST_URL = 'https://suggestion.baidu.com/su';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res
      .status(200)
      .json({ code: 400, message: 'Missing required parameter: q', data: null });
  }

  try {
    const response = await axios.get(BAIDU_SUGGEST_URL, {
      params: { wd: q, action: 'opensearch' },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      responseType: 'arraybuffer',
      timeout: 10000,
    });

    const decoder = new TextDecoder('gbk');
    const text = decoder.decode(response.data);
    const data = JSON.parse(text);

    if (Array.isArray(data) && Array.isArray(data[1])) {
      return res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          query: data[0],
          suggestions: data[1],
        },
      });
    }

    return res
      .status(200)
      .json({ code: 200, message: 'success', data: { query: q, suggestions: [] } });
  } catch (error: any) {
    return res.status(200).json({
      code: error.response?.status || 500,
      message: 'Suggestion service unavailable',
      data: null,
    });
  }
}
