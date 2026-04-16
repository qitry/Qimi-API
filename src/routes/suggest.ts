import type { Request, Response } from 'express';
import axios from 'axios';
import { success, error } from '../../lib/utils/response';
import { logger } from '../../lib/core/logger';

const BAIDU_SUGGEST_URL = 'https://suggestion.baidu.com/su';

export default async function suggestHandler(req: Request, res: Response): Promise<void> {
  const q = req.query.q;

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
}
