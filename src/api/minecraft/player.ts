import type { Request, Response } from 'express';
import httpClient from '../../../lib/utils/http';
import { success, error } from '../../../lib/utils/response';
import { logger } from '../../../lib/core/logger';
import { cache } from '../../../lib/utils/cache';

const MOJANG_API = 'https://api.mojang.com/users/profiles/minecraft';
const CACHE_TTL = 60 * 60 * 1000;

interface PlayerProfile {
  uuid: string;
  name: string;
}

export default async function playerHandler(req: Request, res: Response): Promise<void> {
  const username = (req.query.username as string)?.trim();

  if (!username) {
    res.status(200).json(error(400, '请提供 username 参数', null));
    return;
  }

  if (username.length < 1 || username.length > 16) {
    res.status(200).json(error(400, '玩家名长度应在 1-16 个字符之间', null));
    return;
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    res.status(200).json(error(400, '玩家名只能包含字母、数字和下划线', null));
    return;
  }

  const cacheKey = `mc:player:${username.toLowerCase()}`;
  const cached = cache.get<PlayerProfile>(cacheKey);
  if (cached) {
    res.status(200).json(success(cached));
    return;
  }

  try {
    const response = await httpClient.get(`${MOJANG_API}/${encodeURIComponent(username)}`, {
      validateStatus: (status) => status < 500,
    });

    if (response.status === 204 || response.status === 404 || !response.data) {
      res.status(200).json(error(404, `未找到玩家 "${username}"`, null));
      return;
    }

    const profile: PlayerProfile = {
      uuid: (response.data as { id: string; name: string }).id,
      name: (response.data as { id: string; name: string }).name,
    };

    cache.set(cacheKey, profile, CACHE_TTL);
    res.status(200).json(success(profile));
  } catch (err) {
    logger.error('Minecraft player query failed', err);
    res.status(200).json(error(503, 'Mojang API 服务不可用', null));
  }
}