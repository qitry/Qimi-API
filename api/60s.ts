import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const CACHE: { data?: string[]; timestamp?: number } = {};

const CACHE_DURATION = 60 * 60 * 1000;

async function fetch60s() {
  const now = Date.now();

  if (CACHE.data && CACHE.timestamp && now - CACHE.timestamp < CACHE_DURATION) {
    return { data: CACHE.data, fromCache: true };
  }

  try {
    const response = await axios.get('https://cdn.lylme.com/api/60s/', {
      timeout: 10000,
      headers: {
        'User-Agent': 'qimiapi/1.0',
      },
    });

    if (response.data?.status === 200 && response.data?.data) {
      CACHE.data = response.data.data;
      CACHE.timestamp = now;
      return { data: response.data.data, fromCache: false };
    }
  } catch (error) {
    console.error('Failed to fetch 60s:', error);
  }

  if (CACHE.data) {
    return { data: CACHE.data, fromCache: true };
  }

  return { data: [], fromCache: false };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data, fromCache } = await fetch60s();

  const today = new Date();
  const yyyyMMdd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  if (fromCache && data.length > 0) {
    data.unshift('今天的简讯未更新，以下是缓存数据！');
  }

  return res.status(200).json({
    status: 200,
    message: 'success',
    data,
    time: yyyyMMdd,
  });
}
