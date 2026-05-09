import type { Request, Response } from 'express';
import httpClient from '../../../lib/utils/http';
import { success, error } from '../../../lib/utils/response';
import { logger } from '../../../lib/core/logger';

const BAIDU_HOT_API = 'https://zj.v.api.aa1.cn/api/baidu-rs/';

export default async function baiduHandler(req: Request, res: Response): Promise<void> {
  try {
    const response = await httpClient.get(BAIDU_HOT_API);
    if (response.data.code !== 1) {
      res.status(200).json(error(500, 'Hot list unavailable', null));
      return;
    }
    const items = response.data.data.map((item: Record<string, unknown>) => ({
      index: item.index,
      title: item.title,
      hot: item.hot,
      desc: item.desc || '',
      image: item.pic || '',
      url: item.url,
    }));
    res.status(200).json(success(items));
  } catch (err) {
    logger.error('Baidu hot failed', err);
    res.status(200).json(error(500, 'Hot list unavailable', null));
  }
}
