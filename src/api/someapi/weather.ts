import type { Request, Response } from 'express';
import httpClient from '../../../lib/utils/http';
import { success, error } from '../../../lib/utils/response';
import { logger } from '../../../lib/core/logger';
import { cache } from '../../../lib/utils/cache';
import { isReservedIp, normalizeIp } from '../../../lib/utils/helpers';
import { getClientIp } from '../../../lib/utils/helpers';

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const IP_API_BASE_URL = 'http://ip-api.com/json/';

const DEFAULT_LAT = 39.9042;
const DEFAULT_LON = 116.4074;

export default async function weatherHandler(req: Request, res: Response): Promise<void> {
  const { latitude, longitude, ip, ...rest } = req.query;
  let lat = latitude as string | undefined;
  let lon = longitude as string | undefined;

  if (!lat || !lon) {
    const queryIp = normalizeIp((ip || getClientIp(req)) as string);

    if (!isReservedIp(queryIp)) {
      try {
        const ipRes = await httpClient.get(`${IP_API_BASE_URL}${queryIp}`);
        if (ipRes.data.status === 'success') {
          lat = ipRes.data.lat;
          lon = ipRes.data.lon;
          res.setHeader('X-Location-City', ipRes.data.city || '');
        }
      } catch (err) {
        logger.error('Weather IP lookup failed', err);
      }
    }

    if (!lat || !lon) {
      lat = String(DEFAULT_LAT);
      lon = String(DEFAULT_LON);
      res.setHeader('X-Location-City', '北京 (默认)');
      res.setHeader('X-Location-Fallback', 'true');
    }
  }

  const cacheKey = `weather:${lat},${lon}`;
  const cached = cache.get<unknown>(cacheKey);
  if (cached) {
    res.status(200).json(success(cached));
    return;
  }

  try {
    const response = await httpClient.get(OPEN_METEO_BASE_URL, {
      params: { latitude: lat, longitude: lon, current_weather: true, ...rest },
    });
    const result = { ...response.data, location: { lat, lon } };
    cache.set(cacheKey, result, 10 * 60 * 1000);
    res.status(200).json(success(result));
  } catch (err) {
    logger.error('Weather API failed', err);
    res.status(200).json(error(503, 'Weather service unavailable', null));
  }
}
