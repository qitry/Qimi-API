import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const IP_API_BASE_URL = 'http://ip-api.com/json/';

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
      return res.status(200).json({ code: 400, message: 'Query failed', data: response.data });
    }

    return res.status(200).json({ code: 200, message: 'success', data: response.data });
  } catch (error: any) {
    return res.status(200).json({
      code: error.response?.status || 500,
      message: 'IP lookup failed',
      data: null,
    });
  }
}
