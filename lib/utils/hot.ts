import axios from 'axios';
import { logger } from '../core/logger';
import type { HotPlatform } from '../../src/types/hot';

const PLATFORM_CACHE: Record<string, { data?: unknown[]; timestamp?: number }> = {};
const CACHE_DURATION = 30 * 60 * 1000;

export async function getPlatformData(platform: string): Promise<unknown[] | null> {
  const now = Date.now();
  const cached = PLATFORM_CACHE[platform];

  if (cached?.data && cached?.timestamp && now - cached.timestamp < CACHE_DURATION) {
    return cached.data as unknown[];
  }

  try {
    const response = await axios.get('https://cdn.lylme.com/api/hot/', {
      timeout: 10000,
      headers: { 'User-Agent': 'qimiapi/1.0' },
    });

    if (response.data?.code === 200 && response.data?.data) {
      const platformData = response.data.data.find((p: HotPlatform) => p.alias === platform);
      if (platformData) {
        PLATFORM_CACHE[platform] = { data: platformData.data, timestamp: now };
        return platformData.data as unknown[];
      }
    }
  } catch (err) {
    logger.error(`Platform ${platform} failed`, err);
  }

  return (cached?.data as unknown[]) || null;
}
