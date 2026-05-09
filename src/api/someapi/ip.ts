import type { Request, Response } from 'express';
import httpClient from '../../../lib/utils/http';
import { success, error } from '../../../lib/utils/response';
import { logger } from '../../../lib/core/logger';
import { cache } from '../../../lib/utils/cache';
import { getClientIp, normalizeIp, isReservedIp } from '../../../lib/utils/helpers';

const IP_API_BASE_URL = 'http://ip-api.com/json/';

export { isReservedIp, normalizeIp };

export default async function ipHandler(req: Request, res: Response): Promise<void> {
  const { query: queryParam = '', lang = 'zh-CN', ...rest } = req.query;
  let query = (queryParam || getClientIp(req)) as string;
  query = normalizeIp(query);

  if (isReservedIp(query)) {
    res.status(200).json(error(400, '无法解析本地/保留 IP，请通过 query 参数指定公网 IP', null));
    return;
  }

  const cacheKey = `ip:${query}:${lang}`;
  const cached = cache.get<unknown>(cacheKey);
  if (cached) {
    res.status(200).json(success(cached));
    return;
  }

  try {
    const response = await httpClient.get(`${IP_API_BASE_URL}${query}`, {
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
    cache.set(cacheKey, response.data, 5 * 60 * 1000);
    res.status(200).json(success(response.data));
  } catch (err) {
    logger.error('IP lookup failed', err);
    res.status(200).json(error(500, 'IP lookup failed', null));
  }
}
