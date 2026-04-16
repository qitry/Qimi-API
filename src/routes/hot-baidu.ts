import type { Request, Response } from 'express';
import { success } from '../../lib/utils/response';
import { getPlatformData } from '../../lib/utils/hot';

export default async function baiduHotHandler(req: Request, res: Response): Promise<void> {
  const data = await getPlatformData('baidu');
  res.status(200).json(success(data || []));
}
