import type { VercelRequest, VercelResponse } from '@vercel/node';
import openapi from './openapi-spec.json';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json(openapi);
}
