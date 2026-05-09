import type { Request, Response } from 'express';
import httpClient from '../../../lib/utils/http';
import { success, error } from '../../../lib/utils/response';
import { logger } from '../../../lib/core/logger';
import { cache } from '../../../lib/utils/cache';

const MOJANG_API = 'https://api.mojang.com/user/profiles';
const CACHE_TTL = 60 * 60 * 1000;

interface NameEntry {
  name: string;
  changedToAt?: number;
}

export default async function namesHandler(req: Request, res: Response): Promise<void> {
  const uuid = (req.query.uuid as string)?.trim();

  if (!uuid) {
    res.status(200).json(error(400, '请提供 uuid 参数', null));
    return;
  }

  const cleanUuid = uuid.replace(/-/g, '');
  if (!/^[0-9a-fA-F]{32}$/.test(cleanUuid)) {
    res.status(200).json(error(400, 'UUID 格式无效，应为 32 位十六进制字符串', null));
    return;
  }

  const cacheKey = `mc:names:${cleanUuid.toLowerCase()}`;
  const cached = cache.get<NameEntry[]>(cacheKey);
  if (cached) {
    res.status(200).json(success(cached));
    return;
  }

  try {
    const response = await httpClient.get<NameEntry[]>(`${MOJANG_API}/${cleanUuid}/names`, {
      validateStatus: (status) => status < 500,
    });

    if (response.status === 204 || response.status === 404 || !response.data) {
      res.status(200).json(error(404, '未找到该玩家的名称历史', null));
      return;
    }

    cache.set(cacheKey, response.data, CACHE_TTL);
    res.status(200).json(success(response.data));
  } catch (err) {
    logger.error('Minecraft names query failed', err);
    res.status(200).json(error(503, 'Mojang API 服务不可用', null));
  }
}