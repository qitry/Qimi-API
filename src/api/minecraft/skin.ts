import type { Request, Response } from 'express';
import httpClient from '../../../lib/utils/http';
import { success, error } from '../../../lib/utils/response';
import { logger } from '../../../lib/core/logger';
import { cache } from '../../../lib/utils/cache';

const MOJANG_API = 'https://sessionserver.mojang.com/session/minecraft/profile';
const CACHE_TTL = 60 * 60 * 1000;

interface TextureProperty {
  name: string;
  value: string;
  signature: string;
}

interface ProfileResponse {
  id: string;
  name: string;
  properties: TextureProperty[];
}

interface DecodedTextures {
  SKIN?: { url: string; metadata?: { model: string } };
  CAPE?: { url: string };
}

export default async function skinHandler(req: Request, res: Response): Promise<void> {
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

  const cacheKey = `mc:skin:${cleanUuid.toLowerCase()}`;
  const cached = cache.get<object>(cacheKey);
  if (cached) {
    res.status(200).json(success(cached));
    return;
  }

  try {
    const response = await httpClient.get<ProfileResponse>(
      `${MOJANG_API}/${cleanUuid}`,
      {
        params: { unsigned: false },
        validateStatus: (status) => status < 500,
      },
    );

    if (response.status === 204 || response.status === 404 || !response.data) {
      res.status(200).json(error(404, '未找到该玩家的皮肤信息', null));
      return;
    }

    const texturesProp = response.data.properties?.find(
      (p: TextureProperty) => p.name === 'textures',
    );

    if (!texturesProp) {
      const result = { name: response.data.name, uuid: response.data.id, skin: null, cape: null };
      cache.set(cacheKey, result, CACHE_TTL);
      res.status(200).json(success(result));
      return;
    }

    const decoded = JSON.parse(Buffer.from(texturesProp.value, 'base64').toString('utf-8')) as {
      textures: DecodedTextures;
      timestamp?: number;
      profileId?: string;
      profileName?: string;
    };

    const textures = decoded.textures;

    const result = {
      name: response.data.name,
      uuid: response.data.id,
      timestamp: decoded.timestamp || null,
      skin: textures.SKIN
        ? {
            url: textures.SKIN.url,
            model: textures.SKIN.metadata?.model === 'slim' ? 'slim' : 'default',
          }
        : null,
      cape: textures.CAPE ? { url: textures.CAPE.url } : null,
    };

    cache.set(cacheKey, result, CACHE_TTL);
    res.status(200).json(success(result));
  } catch (err) {
    logger.error('Minecraft skin query failed', err);
    res.status(200).json(error(503, 'Mojang API 服务不可用', null));
  }
}