import type { Request, Response } from 'express';
import { success, error } from '../../../lib/utils/response';
import { cache } from '../../../lib/utils/cache';

const CACHE_TTL = 24 * 60 * 60 * 1000;

interface AbstractAvatarInfo {
  svg: string;
  seed: string;
  colors: string[];
}

function stringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function hashToColor(hash: number, index: number): string {
  const h = ((hash >> (index * 8)) % 360 + 360) % 360;
  const s = 60 + ((hash >> (index * 4)) % 30);
  const l = 40 + ((hash >> (index * 6)) % 20);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function generateAbstractAvatarSVG(seed: string): string {
  const hash = stringToHash(seed);
  const colors = [
    hashToColor(hash, 0),
    hashToColor(hash, 1),
    hashToColor(hash, 2),
    hashToColor(hash, 3),
  ];

  let shapes = '';
  const gridSize = 5;
  const cellSize = 400 / gridSize;

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const positionHash = hash ^ ((x * gridSize + y) * 7919);
      const cellColorIndex = positionHash % colors.length;
      const shapeType = (positionHash >> 4) % 4;

      const cx = x * cellSize + cellSize / 2;
      const cy = y * cellSize + cellSize / 2;
      const size = cellSize * 0.4 + ((positionHash >> 8) % 10);

      let shape = '';
      switch (shapeType) {
        case 0: {
          const rotation = (positionHash >> 12) % 360;
          shape = `<rect x="${cx - size}" y="${cy - size}" width="${size * 2}" height="${size * 2}" fill="${colors[cellColorIndex]}" transform="rotate(${rotation} ${cx} ${cy})" />`;
          break;
        }
        case 1: {
          const radius = size;
          shape = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${colors[cellColorIndex]}" />`;
          break;
        }
        case 2: {
          const points = [];
          const vertices = 3 + ((positionHash >> 8) % 4);
          for (let i = 0; i < vertices; i++) {
            const angle = (i / vertices) * Math.PI * 2 + ((positionHash >> 12) / 1000);
            const px = cx + Math.cos(angle) * size;
            const py = cy + Math.sin(angle) * size;
            points.push(`${px},${py}`);
          }
          shape = `<polygon points="${points.join(' ')}" fill="${colors[cellColorIndex]}" />`;
          break;
        }
        case 3: {
          const x2 = cx + ((positionHash >> 8) % 20) - 10;
          const y2 = cy + ((positionHash >> 12) % 20) - 10;
          const x3 = cx + ((positionHash >> 16) % 20) - 10;
          const y3 = cy + ((positionHash >> 20) % 20) - 10;
          shape = `<polygon points="${cx},${cy} ${x2},${y2} ${x3},${y3}" fill="${colors[cellColorIndex]}" />`;
          break;
        }
      }
      shapes += shape;
    }
  }

  const bgHash = hash ^ 0xDEADBEEF;
  const bgColor = hashToColor(bgHash, 5);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="400" height="400" fill="${bgColor}" />
  ${shapes}
  <rect width="400" height="400" fill="rgba(0,0,0,0.1)" />
</svg>`;

  return svg;
}

export default async function abstractAvatarHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const seed = (req.query.seed as string)?.trim() || '';
  const outputType = (req.query.output as string)?.trim() || 'json';

  if (outputType !== 'json' && outputType !== 'image') {
    res.status(200).json(error(400, '输出类型必须是 json 或 image', null));
    return;
  }

  if (!seed) {
    res.status(200).json(error(400, '请提供 seed 参数', null));
    return;
  }

  if (seed.length > 64) {
    res.status(200).json(error(400, '种子长度不能超过 64 个字符', null));
    return;
  }

  const cacheKey = `abstract-avatar:${seed}:${outputType}`;
  const cached = cache.get<AbstractAvatarInfo | Buffer>(cacheKey);
  if (cached) {
    if (outputType === 'image' && Buffer.isBuffer(cached)) {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.status(200).send(cached);
      return;
    } else if (outputType === 'json') {
      res.status(200).json(success(cached as AbstractAvatarInfo));
      return;
    }
  }

  try {
    const svg = generateAbstractAvatarSVG(seed);

    if (outputType === 'image') {
      const imageBuffer = Buffer.from(svg, 'utf-8');
      cache.set(cacheKey, imageBuffer, CACHE_TTL);

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.status(200).send(imageBuffer);
    } else {
      const hash = stringToHash(seed);
      const colors = [
        hashToColor(hash, 0),
        hashToColor(hash, 1),
        hashToColor(hash, 2),
        hashToColor(hash, 3),
      ];

      const avatarInfo: AbstractAvatarInfo = {
        svg: svg,
        seed,
        colors,
      };

      cache.set(cacheKey, avatarInfo, CACHE_TTL);
      res.status(200).json(success(avatarInfo));
    }
  } catch (err) {
    res.status(200).json(error(500, '抽象头像生成失败', null));
  }
}