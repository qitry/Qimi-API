import type { Request, Response } from 'express';
import { success, error } from '../../../lib/utils/response';

export default async function timestampHandler(req: Request, res: Response): Promise<void> {
  const { timestamp, format } = req.query;

  try {
    let result: string | number;

    if (timestamp && typeof timestamp === 'string') {
      // 时间戳转日期
      const ts = parseInt(timestamp, 10);
      if (isNaN(ts)) {
        res.status(200).json(error(400, '无效的时间戳', null));
        return;
      }

      const date = new Date(ts * 1000);
      const dateFormat = format && typeof format === 'string' ? format : 'YYYY-MM-DD HH:mm:ss';

      result = formatDate(date, dateFormat);
    } else {
      // 日期转时间戳
      const now = new Date();
      result = Math.floor(now.getTime() / 1000);
    }

    res.status(200).json(success(result));
  } catch (err) {
    res.status(200).json(error(400, '时间转换失败', null));
  }
}

function formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}