import type { Request, Response } from 'express';
import { success } from '../../../lib/utils/response';
import { getAllHotData, getPlatformData } from '../../../lib/utils/hot';

export default async function hotHandler(req: Request, res: Response): Promise<void> {
  const { type } = req.query;

  if (type && typeof type === 'string') {
    const data = await getPlatformData(type);
    res.status(200).json(data ? success(data) : success(await getAllHotData()));
    return;
  }

  res.status(200).json(success(await getAllHotData()));
}
