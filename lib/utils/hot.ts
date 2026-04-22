import { logger } from '../core/logger';
import { cache } from './cache';
import httpClient from './http';
import type { HotPlatform } from '../../src/types/hot';

const HOT_API = 'https://cdn.lylme.com/api/hot/';
const CACHE_TTL = 30 * 60 * 1000;

async function fetchAllHotData(): Promise<HotPlatform[]> {
  return cache.getOrSet(
    '__hot_all',
    async () => {
      const response = await httpClient.get(HOT_API, {
        headers: { 'User-Agent': 'qimiapi/1.0' },
      });
      if (response.data?.code === 200 && response.data?.data) {
        return response.data.data;
      }
      return [];
    },
    CACHE_TTL,
  );
}

export async function getPlatformData(platform: string): Promise<unknown[] | null> {
  try {
    const allData = await fetchAllHotData();
    const found = allData.find((p: HotPlatform) => p.alias === platform);
    return found ? (found.data as unknown[]) : null;
  } catch (err) {
    logger.error(`Platform ${platform} failed`, err);
    return null;
  }
}

export async function getAllHotData(): Promise<unknown[]> {
  try {
    return await fetchAllHotData();
  } catch (err) {
    logger.error('Hot fetch failed', err);
    return [];
  }
}
