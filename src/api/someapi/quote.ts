import type { Request, Response } from 'express';
import { success, error } from '../../../lib/utils/response';
import fs from 'fs';
import path from 'path';

const QUOTES_FILE = path.join(process.cwd(), 'data', 'quotes.txt');

export default async function quoteHandler(req: Request, res: Response): Promise<void> {
  try {
    if (!fs.existsSync(QUOTES_FILE)) {
      res.status(200).json(error(400, '一言数据文件不存在', null));
      return;
    }

    const content = fs.readFileSync(QUOTES_FILE, 'utf-8');
    const quotes = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (quotes.length === 0) {
      res.status(200).json(error(400, '一言数据文件为空', null));
      return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    res.status(200).json(
      success({
        quote,
        index: randomIndex + 1,
        total: quotes.length,
        date: new Date().toISOString().split('T')[0],
      })
    );
  } catch (err) {
    res.status(200).json(error(400, '获取一言失败', null));
  }
}