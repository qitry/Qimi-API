import type { Request, Response } from 'express';
import { success, error } from '../../lib/utils/response';

export default async function base64Handler(req: Request, res: Response): Promise<void> {
  const { action, text } = req.query;

  if (!text || typeof text !== 'string') {
    res.status(200).json(error(400, '请提供 text 参数', null));
    return;
  }

  if (!action || (action !== 'encode' && action !== 'decode')) {
    res.status(200).json(error(400, '请提供 action 参数 (encode/decode)', null));
    return;
  }

  try {
    let result: string;
    if (action === 'encode') {
      result = Buffer.from(text, 'utf-8').toString('base64');
    } else {
      result = Buffer.from(text, 'base64').toString('utf-8');
    }

    res.status(200).json(success(result));
  } catch (err) {
    res.status(200).json(error(400, 'Base64 转换失败，请检查输入', null));
  }
}