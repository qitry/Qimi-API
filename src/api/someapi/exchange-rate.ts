import type { Request, Response } from 'express';
import httpClient from '../../../lib/utils/http';
import { success, error } from '../../../lib/utils/response';
import { logger } from '../../../lib/core/logger';
import { cache } from '../../../lib/utils/cache';
import { parseQuery } from '../../../lib/utils/helpers';

const EXCHANGE_API = 'https://open.er-api.com/v6/latest';
const CACHE_TTL = 60 * 60 * 1000;

interface RateData {
  base_code: string;
  rates: Record<string, number>;
  time_last_update_utc: string;
}

async function fetchRates(base: string): Promise<RateData | null> {
  const cacheKey = `exchange-rate:${base}`;
  const cached = cache.get<RateData>(cacheKey);
  if (cached) return cached;

  try {
    const response = await httpClient.get(`${EXCHANGE_API}/${base}`);
    if (!response.data?.rates) return null;
    const data = response.data as RateData;
    cache.set(cacheKey, data, CACHE_TTL);
    return data;
  } catch (err) {
    logger.error('Exchange rate fetch failed', err);
    return null;
  }
}

export default async function exchangeRateHandler(req: Request, res: Response): Promise<void> {
  const from = (parseQuery(req.query.from) || 'USD').toUpperCase();
  const to = (parseQuery(req.query.to) || 'CNY').toUpperCase();
  const amount = Math.max(0, Number(req.query.amount) || 1);

  const rateData = await fetchRates(from);
  if (!rateData) {
    res.status(200).json(error(503, 'Exchange rate service unavailable', null));
    return;
  }

  if (!(to in rateData.rates)) {
    res
      .status(200)
      .json(error(400, `Unknown target currency: ${to}`, { available: Object.keys(rateData.rates) }));
    return;
  }

  const rate = rateData.rates[to];
  const result = {
    from,
    to,
    amount,
    rate,
    result: Math.round(amount * rate * 100) / 100,
    last_updated: rateData.time_last_update_utc,
  };

  res.status(200).json(success(result));
}
