import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const BAIDU_HOT_API = 'https://zj.v.api.aa1.cn/api/baidu-rs/';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await axios.get(BAIDU_HOT_API, { timeout: 10000 });

    if (response.data.code !== 1) {
      return res.status(200).json({ code: 500, message: 'Hot list unavailable', data: null });
    }

    const items = response.data.data.map((item: any) => ({
      index: item.index,
      title: item.title,
      hot: item.hot,
      desc: item.desc || '',
      image: item.pic || '',
      url: item.url,
    }));

    return res.status(200).json({ code: 200, message: 'success', data: items });
  } catch (error: any) {
    return res.status(200).json({ code: 500, message: 'Hot list unavailable', data: null });
  }
}
