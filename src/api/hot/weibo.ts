import type { Request, Response } from 'express';
import { success } from '../../../lib/utils/response';
import { getPlatformData } from '../../../lib/utils/hot';

export default async function weiboHotHandler(req: Request, res: Response): Promise<void> {
  const data = await getPlatformData('weibo');
  res.status(200).json(success(data || []));
}
