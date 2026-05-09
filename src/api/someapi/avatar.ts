import type { Request, Response } from 'express';
import httpClient from '../../../lib/utils/http';
import { success, error } from '../../../lib/utils/response';
import { parseInteger } from '../../../lib/utils/helpers';
import { cache } from '../../../lib/utils/cache';

const CACHE_TTL = 24 * 60 * 60 * 1000;

interface AvatarInfo {
  url: string;
  style: string;
  size: number;
  seed: string;
}

function generateAvatarUrl(style: string, seed: string, size: number): string {
  const encodedSeed = encodeURIComponent(seed);

  switch (style) {
    case 'uiavatars':
      return `https://ui-avatars.com/api/?name=${encodedSeed}&size=${size}&background=random&color=fff&font-size=0.33`;

    case 'dicebear-avataaars':
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodedSeed}&size=${size}`;

    case 'dicebear-initials':
      return `https://api.dicebear.com/7.x/initials/svg?seed=${encodedSeed}&size=${size}&backgroundColor=ffdfbf`;

    case 'dicebear-bottts':
      return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodedSeed}&size=${size}`;

    case 'robohash':
      return `https://robohash.org/${encodedSeed}?size=${size}x${size}`;

    default:
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodedSeed}&size=${size}`;
  }
}

export default async function avatarHandler(req: Request, res: Response): Promise<void> {
  const seed = (req.query.seed as string)?.trim() || 'default';
  const style = (req.query.style as string)?.trim() || 'dicebear-avataaars';
  const size = Math.max(50, Math.min(parseInteger(req.query.size, 200), 1000));
  const outputType = (req.query.output as string)?.trim() || 'json';

  const validStyles = [
    'uiavatars',
    'dicebear-avataaars',
    'dicebear-initials',
    'dicebear-bottts',
    'robohash',
  ];

  if (!validStyles.includes(style)) {
    res.status(200).json(
      error(
        400,
        `无效的风格。支持的风格: ${validStyles.join(', ')}`,
        { availableStyles: validStyles },
      )
    );
    return;
  }

  if (outputType !== 'json' && outputType !== 'image') {
    res.status(200).json(error(400, '输出类型必须是 json 或 image', null));
    return;
  }

  const cacheKey = `avatar:${style}:${seed}:${size}:${outputType}`;
  const cached = cache.get<AvatarInfo | Buffer>(cacheKey);
  if (cached) {
    if (outputType === 'image' && Buffer.isBuffer(cached)) {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.status(200).send(cached);
      return;
    } else if (outputType === 'json') {
      res.status(200).json(success(cached as AvatarInfo));
      return;
    }
  }

  const avatarUrl = generateAvatarUrl(style, seed, size);

  try {
    if (outputType === 'image') {
      const response = await httpClient.get(avatarUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
      });

      const imageBuffer = Buffer.from(response.data, 'binary');
      cache.set(cacheKey, imageBuffer, CACHE_TTL);

      let contentType = 'image/svg+xml';
      const headerContentType = response.headers['content-type'];
      if (typeof headerContentType === 'string') {
        contentType = headerContentType;
      } else if (Array.isArray(headerContentType) && headerContentType.length > 0) {
        contentType = headerContentType[0];
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.status(200).send(imageBuffer);
    } else {
      const avatarInfo: AvatarInfo = {
        url: avatarUrl,
        style,
        size,
        seed,
      };

      cache.set(cacheKey, avatarInfo, CACHE_TTL);
      res.status(200).json(success(avatarInfo));
    }
  } catch (err) {
    const fallbackUrl = generateAvatarUrl('dicebear-avataaars', seed, size);
    const fallbackInfo: AvatarInfo = {
      url: fallbackUrl,
      style: 'dicebear-avataaars',
      size,
      seed,
    };

    if (outputType === 'image') {
      try {
        const response = await httpClient.get(fallbackUrl, {
          responseType: 'arraybuffer',
          timeout: 10000,
        });
        const imageBuffer = Buffer.from(response.data, 'binary');

        let contentType = 'image/svg+xml';
        const headerContentType = response.headers['content-type'];
        if (typeof headerContentType === 'string') {
          contentType = headerContentType;
        } else if (Array.isArray(headerContentType) && headerContentType.length > 0) {
          contentType = headerContentType[0];
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.status(200).send(imageBuffer);
      } catch {
        res.status(200).json(error(503, '头像服务暂时不可用，请稍后再试', null));
      }
    } else {
      res.status(200).json(success(fallbackInfo));
    }
  }
}