import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const DATA_URL = 'https://raw.githubusercontent.com/JaneDevStudio/History-in-Today-Data-set/main/history_in_today.json';

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

  const now = new Date();
  const { month, day } = req.query;

  const m = month ? month.toString().padStart(2, '0') : (now.getMonth() + 1).toString().padStart(2, '0');
  const d = day ? day.toString().padStart(2, '0') : now.getDate().toString().padStart(2, '0');
  const dateKey = `${m}-${d}`;

  try {
    const response = await axios.get(DATA_URL);
    const allData = response.data;
    const todayData = allData[dateKey];

    if (!todayData) {
      return res.status(200).json({ code: 404, message: `No data for ${dateKey}`, data: null });
    }

    return res.status(200).json({ code: 200, message: 'success', data: { date: dateKey, ...todayData } });
  } catch (error: any) {
    return res.status(200).json({
      code: error.response?.status || 500,
      message: 'History data unavailable',
      data: null,
    });
  }
}
