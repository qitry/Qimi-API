import type { Request, Response } from 'express';
import { success } from '../../lib/utils/response';
import { getPlatformData } from '../../lib/utils/hot';

export default async function qqnewsHotHotHandler(req: Request, res: Response): Promise<void> {
  const data = await getPlatformData('qqnews_hot');
  res.status(200).json(success(data || []));
}
