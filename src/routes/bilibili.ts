import type { Request, Response } from 'express';
import axios from 'axios';
import { success, error } from '../../lib/utils/response';
import { logger } from '../../lib/core/logger';

const BILIBILI_API = 'https://api.bilibili.com/x/web-interface/ranking/v2';

export default async function bilibiliHandler(req: Request, res: Response): Promise<void> {
  try {
    const response = await axios.get(BILIBILI_API, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 10000,
    });
    if (response.data.code !== 0) {
      res.status(200).json(error(500, 'Hot list unavailable', null));
      return;
    }
    const list = response.data.data.list.map((item: Record<string, unknown>, index: number) => ({
      rank: index + 1,
      aid: item.aid,
      bvid: item.bvid,
      title: item.title,
      url: `https://www.bilibili.com/video/${item.bvid}`,
      cover: item.pic,
      author: (item.owner as Record<string, unknown>)?.name,
      authorFace: (item.owner as Record<string, unknown>)?.face,
      view: (item.stat as Record<string, unknown>)?.view,
      like: (item.stat as Record<string, unknown>)?.like,
      reply: (item.stat as Record<string, unknown>)?.reply,
      favorite: (item.stat as Record<string, unknown>)?.favorite,
      coin: (item.stat as Record<string, unknown>)?.coin,
      duration: item.duration,
      pubdate: item.pubdate,
    }));
    res.status(200).json(success(list));
  } catch (err) {
    logger.error('Bilibili failed', err);
    res.status(200).json(error(500, 'Hot list unavailable', null));
  }
}
