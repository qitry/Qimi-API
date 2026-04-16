import type { Request, Response } from 'express';
import axios from 'axios';
import { success, error } from '../../lib/utils/response';
import { logger } from '../../lib/core/logger';

const IP_API_BASE_URL = 'http://ip-api.com/json/';

export default async function ipHandler(req: Request, res: Response): Promise<void> {
  const { query: queryParam = '', lang = 'zh-CN', ...rest } = req.query;

  const query = queryParam || req.ip;

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
}
