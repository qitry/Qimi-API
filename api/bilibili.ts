import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const BILIBILI_API = 'https://api.bilibili.com/x/web-interface/ranking/v2';

interface BilibiliItem {
  aid: number;
  bvid: string;
  title: string;
  pic: string;
  owner: { name: string; face: string };
  stat: { view: string; like: string; reply: string; favorite: string; coin: string };
  desc: string;
  duration: number;
  pubdate: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await axios.get(BILIBILI_API, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 10000,
    });

    if (response.data.code !== 0) {
      return res.status(200).json({ code: 500, message: 'Hot list unavailable', data: null });
    }

    const list = response.data.data.list.map((item: BilibiliItem, index: number) => ({
      rank: index + 1,
      aid: item.aid,
      bvid: item.bvid,
      title: item.title,
      url: `https://www.bilibili.com/video/${item.bvid}`,
      cover: item.pic,
      author: item.owner.name,
      authorFace: item.owner.face,
      view: item.stat.view,
      like: item.stat.like,
      reply: item.stat.reply,
      favorite: item.stat.favorite,
      coin: item.stat.coin,
      duration: item.duration,
      pubdate: item.pubdate,
    }));

    return res.status(200).json({ code: 200, message: 'success', data: list });
  } catch (error: any) {
    return res.status(200).json({ code: 500, message: 'Hot list unavailable', data: null });
  }
}
