import type { Request, Response } from 'express';
import axios from 'axios';
import { Solar } from 'lunar-javascript';
import { success, error } from '../../lib/utils/response';
import { logger } from '../../lib/core/logger';

const FESTIVAL_API = 'https://festival2.wifilu.com/';
const FORTUNE_API = 'https://api.suyanw.cn/api/huangli.php';

const LUNAR_CACHE: { data?: unknown; timestamp?: number } = {};
const LUNAR_CACHE_DURATION = 60 * 60 * 1000;

export default async function lunarHandler(req: Request, res: Response): Promise<void> {
  const { date } = req.query;
  const now = Date.now();

  if (
    LUNAR_CACHE.data &&
    LUNAR_CACHE.timestamp &&
    now - LUNAR_CACHE.timestamp < LUNAR_CACHE_DURATION
  ) {
    res.status(200).json(success(LUNAR_CACHE.data));
    return;
  }

  try {
    const targetDate = date ? String(date) : undefined;
    const festivalUrl = targetDate
      ? `${FESTIVAL_API}?date=${targetDate}&type=calendar`
      : `${FESTIVAL_API}?type=calendar`;

    const solar = (() => {
      if (targetDate) {
        const parts = targetDate.split('-');
        if (parts.length === 3)
          return Solar.fromYmd(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
      }
      return Solar.fromDate(new Date());
    })();

    const lunar = solar.getLunar();
    const [festivalRes, fortuneRes] = await Promise.allSettled([
      axios.get(festivalUrl, { timeout: 10000 }),
      axios.get(FORTUNE_API, { timeout: 10000 }),
    ]);

    const festival = festivalRes.status === 'fulfilled' ? festivalRes.value.data : null;
    const fortune = fortuneRes.status === 'fulfilled' ? fortuneRes.value.data : null;

    const result = {
      date: solar.toString(),
      solar: {
        year: solar.getYear(),
        month: solar.getMonth(),
        day: solar.getDay(),
        weekday: solar.getWeekInChinese(),
      },
      lunar: {
        year: lunar.getYear(),
        month: lunar.getMonth(),
        day: lunar.getDay(),
        monthName: lunar.getMonthInChinese(),
        dayName: lunar.getDayInChinese(),
        yearShengXiao: lunar.getYearShengXiao(),
      },
      ganzhi: {
        year: lunar.getYearInGanZhi(),
        month: lunar.getMonthInGanZhi(),
        day: lunar.getDayInGanZhi(),
        hour: lunar.getTimeInGanZhi(),
      },
      yi: lunar.getDayYi(),
      ji: lunar.getDayJi(),
      chong: { description: lunar.getChongDesc(), sha: lunar.getSha() },
      pengZu: { gan: lunar.getPengZuGan(), zhi: lunar.getPengZuZhi() },
      festivals: {
        lunar: festival?.festival_lunar || '',
        solar: festival?.festival_solar || '',
        solarTerm: festival?.solar_term || lunar.getJieQi(),
      },
      fortune: fortune?.星座运势 || null,
    };

    LUNAR_CACHE.data = result;
    LUNAR_CACHE.timestamp = now;
    res.status(200).json(success(result));
  } catch (err) {
    logger.error('Lunar failed', err);
    res.status(200).json(error(503, 'Lunar calendar service unavailable', null));
  }
}
