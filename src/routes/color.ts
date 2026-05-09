import type { Request, Response } from 'express';
import { success, error } from '../../lib/utils/response';

export default async function colorHandler(req: Request, res: Response): Promise<void> {
  const { color, format } = req.query;

  if (!color || typeof color !== 'string') {
    res.status(200).json(
      success({
        message: '请提供 color 参数',
        examples: [
          { input: 'color=#ff0000&format=rgb', description: 'HEX 转 RGB' },
          { input: 'color=rgb(255,0,0)&format=hex', description: 'RGB 转 HEX' },
          { input: 'color=rgb(255,0,0)&format=hsl', description: 'RGB 转 HSL' },
        ],
      })
    );
    return;
  }

  try {
    const rgb = parseToRGB(color);
    if (!rgb) {
      res.status(200).json(error(400, '无效的颜色格式', null));
      return;
    }

    const targetFormat = format && typeof format === 'string' ? format : 'all';

    let result: Record<string, string>;

    if (targetFormat === 'hex') {
      result = { hex: rgbToHex(rgb.r, rgb.g, rgb.b) };
    } else if (targetFormat === 'rgb') {
      result = { rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` };
    } else if (targetFormat === 'hsl') {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      result = { hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` };
    } else {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      result = {
        hex: rgbToHex(rgb.r, rgb.g, rgb.b),
        rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      };
    }

    res.status(200).json(success(result));
  } catch (err) {
    res.status(200).json(error(400, '颜色转换失败', null));
  }
}

function parseToRGB(color: string): { r: number; g: number; b: number } | null {
  color = color.trim();

  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b };
    } else if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b };
    }
  } else if (color.startsWith('rgb(')) {
    const match = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (match) {
      return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
    }
  } else if (color.startsWith('hsl(')) {
    const match = color.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/);
    if (match) {
      const h = parseInt(match[1]);
      const s = parseInt(match[2]);
      const l = parseInt(match[3]);
      return hslToRgb(h, s, l);
    }
  }

  return null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}