import type { Request, Response } from 'express';
import { getPlatformData } from '../../lib/utils/hot';
import { success } from '../../lib/utils/response';

export default async function qqnewsCurationHotHandler(req: Request, res: Response): Promise<void> {
  const data = await getPlatformData('qqnews_curation');
  res.status(200).json(success(data || []));
}
