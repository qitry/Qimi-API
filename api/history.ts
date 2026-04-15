import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const CACHE: { data?: HistoryItem[]; timestamp?: number } = {};

const CACHE_DURATION = 60 * 60 * 1000;

interface HistoryItem {
  year: number;
  title: string;
  desc: string;
  link: string;
  date: string;
}

async function fetchHistoryToday(month: string, day: string): Promise<HistoryItem[]> {
  const now = Date.now();

  if (CACHE.data && CACHE.timestamp && now - CACHE.timestamp < CACHE_DURATION) {
    return CACHE.data;
  }

  try {
    const monthStr = month.padStart(2, '0');
    const url = `https://cdn.lylme.com/api/history/${monthStr}.json`;
    const response = await axios.get(url, { timeout: 10000 });

    const monthData = response.data?.[monthStr];
    if (!monthData) return [];

    const dayKey = monthStr + day;
    const dayData = monthData[dayKey];

    if (!dayData || !Array.isArray(dayData)) return [];

    const result: HistoryItem[] = dayData.map((item: Record<string, unknown>) => ({
      year: item.year as number,
      title: String(item.title).replace(/<[^>]*>/g, ''),
      desc: String(item.desc || '').replace(/<[^>]*>/g, ''),
      link: (item.link as string) || '',
      date: dayKey,
    }));

    CACHE.data = result;
    CACHE.timestamp = now;

    return result;
  } catch (error) {
    console.error('Failed to fetch history:', error);
    return CACHE.data || [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const now = new Date();
  const month = String(now.getMonth() + 1);
  const day = String(now.getDate());

  const data = await fetchHistoryToday(month, day);

  return res.status(200).json({
    status: 200,
    message: 'success',
    data,
    time: `${month.padStart(2, '0')}${day.padStart(2, '0')}`,
  });
}
