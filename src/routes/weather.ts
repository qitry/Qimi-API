import type { Request, Response } from 'express';
import axios from 'axios';
import { success, error } from '../../lib/utils/response';
import { logger } from '../../lib/core/logger';

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const IP_API_BASE_URL = 'http://ip-api.com/json/';

export default async function weatherHandler(req: Request, res: Response): Promise<void> {
  const { latitude, longitude, ip, ...rest } = req.query;
  let lat = latitude as string | undefined;
  let lon = longitude as string | undefined;

  if (!lat || !lon) {
    const clientIp = ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ipStr = Array.isArray(clientIp) ? clientIp[0] : clientIp;
    try {
      const ipRes = await axios.get(
        `${IP_API_BASE_URL}${ipStr === '::1' || ipStr === '127.0.0.1' ? '' : ipStr}`,
      );
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
}
