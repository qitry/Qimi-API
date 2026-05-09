import type { Request, Response } from 'express';
import QRCode from 'qrcode';
import { error } from '../../../lib/utils/response';
import { parseInteger } from '../../../lib/utils/helpers';

export default async function qrcodeHandler(req: Request, res: Response): Promise<void> {
  const text = (req.query.text as string)?.trim();

  if (!text) {
    res.status(200).json(error(400, 'Missing required parameter: text', null));
    return;
  }

  if (text.length > 2000) {
    res.status(200).json(error(400, 'Text too long, max 2000 characters', null));
    return;
  }

  const size = Math.max(50, Math.min(parseInteger(req.query.size, 300), 1000));
  const margin = Math.max(0, Math.min(parseInteger(req.query.margin, 4), 50));
  const format = req.query.format === 'svg' ? 'svg' : 'png';

  try {
    if (format === 'svg') {
      const svg = await QRCode.toString(text, {
        type: 'svg',
        width: size,
        margin,
        errorCorrectionLevel: 'M',
      });
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.status(200).send(svg);
    } else {
      const buf = await QRCode.toBuffer(text, {
        width: size,
        margin,
        errorCorrectionLevel: 'M',
      });
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.status(200).send(buf);
    }
  } catch (err) {
    res.status(200).json(error(500, 'QR code generation failed', null));
  }
}
