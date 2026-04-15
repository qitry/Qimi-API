import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const IP_API_BASE_URL = 'https://ip-api.com/json/';

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { latitude, longitude, ip, ...rest } = req.query;
  let lat = latitude as string | undefined;
  let lon = longitude as string | undefined;

  if (!lat || !lon) {
    const clientIp = ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ipStr = Array.isArray(clientIp) ? clientIp[0] : clientIp;

    try {
      const ipRes = await axios.get(`${IP_API_BASE_URL}${ipStr === '::1' || ipStr === '127.0.0.1' ? '' : ipStr}`);
      const ipData = ipRes.data;

      if (ipData.status === 'success') {
        lat = ipData.lat;
        lon = ipData.lon;
        res.setHeader('X-Location-City', ipData.city || '');
      } else {
        return res.status(200).json({ code: 400, message: 'IP 定位失败', data: null });
      }
    } catch {
      return res.status(200).json({ code: 500, message: '定位服务不可用', data: null });
    }
  }

  try {
    const response = await axios.get(OPEN_METEO_BASE_URL, {
      params: { latitude: lat, longitude: lon, current_weather: true, ...rest },
    });

    return res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        ...response.data,
        location: { lat, lon },
      },
    });
  } catch (error: any) {
    return res.status(200).json({
      code: error.response?.status || 500,
      message: 'Weather service unavailable',
      data: null,
    });
  }
}
