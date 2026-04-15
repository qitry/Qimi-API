import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

interface HotItem {
  name: string;
  alias: string;
  url: string;
  hot: string;
  desc: string;
}

interface HotSource {
  name: string;
  alias: string;
  data: HotItem[];
}

const CACHE: { data?: HotSource[]; timestamp?: number } = {};

const CACHE_DURATION = 30 * 60 * 1000;

async function fetchHotList(): Promise<HotSource[]> {
  const now = Date.now();

  if (CACHE.data && CACHE.timestamp && now - CACHE.timestamp < CACHE_DURATION) {
    return CACHE.data;
  }

  try {
    const response = await axios.get('https://cdn.lylme.com/api/hot/', {
      timeout: 10000,
      headers: {
        'User-Agent': 'qimiapi/1.0',
      },
    });

    if (response.data?.code === 200 && response.data?.data) {
      CACHE.data = response.data.data;
      CACHE.timestamp = now;
      return response.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch hot list:', error);
  }

  return CACHE.data || [];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type } = req.query;

  const allData = await fetchHotList();

  if (type && typeof type === 'string') {
    const filtered = allData.filter((source) => source.alias === type);
    if (filtered.length > 0) {
      return res.status(200).json({
        code: 200,
        message: 'success',
        data: filtered[0].data,
        name: filtered[0].name,
      });
    }
  }

  return res.status(200).json({
    code: 200,
    message: 'success',
    data: allData,
  });
}
