import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { Solar, HolidayUtil } from 'lunar-javascript';

const FESTIVAL_API = 'https://festival2.wifilu.com/';
const FORTUNE_API = 'https://api.suyanw.cn/api/huangli.php';

interface FestivalData {
  date: string;
  year: number;
  month: number;
  day: number;
  weekday: string;
  lunar_year: string;
  lunar_month_name: string;
  lunar_day_name: string;
  festival_lunar: string;
  festival_solar: string;
  festival_computed: string;
  solar_term: string;
  display_name: string;
  is_leap_month: boolean;
}

interface FortuneData {
  时间: string;
  节气: string;
  时辰: string;
  星座运势: {
    今日一言: string;
    综合运势: number;
    幸运颜色: string;
    幸运数字: number;
    速配星座: string;
  };
  农历: string;
  天干地支: string;
}

function getSolar(date?: string) {
  if (date) {
    const parts = date.split('-');
    if (parts.length === 3) {
      return Solar.fromYmd(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
    }
  }
  return Solar.fromDate(new Date());
}

function getLunarInfo(solar: Solar) {
  const lunar = solar.getLunar();
  const ganZhiYear = lunar.getYearInGanZhi();
  const ganZhiMonth = lunar.getMonthInGanZhi();
  const ganZhiDay = lunar.getDayInGanZhi();

  const festivals: string[] = [];
  const holiday = HolidayUtil.getHoliday(solar.toYmd());
  if (holiday) {
    festivals.push(holiday.getName());
  }

  return {
    solar: {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
      weekday: solar.getWeekInChinese(),
      weekdayIndex: solar.getWeek(),
      dateString: solar.toString(),
      fullDate: solar.toFullString(),
    },
    lunar: {
      year: lunar.getYear(),
      month: lunar.getMonth(),
      day: lunar.getDay(),
      monthName: lunar.getMonthInChinese(),
      dayName: lunar.getDayInChinese(),
      isLeapMonth: lunar.isLeapMonth(),
      ganzhiYear: ganZhiYear,
      ganzhiMonth: ganZhiMonth,
      ganzhiDay: ganZhiDay,
      yearShengXiao: lunar.getYearShengXiao(),
      monthShengXiao: lunar.getMonthShengXiao(),
      dayShengXiao: lunar.getDayShengXiao(),
    },
    ganzhi: {
      year: ganZhiYear,
      month: ganZhiMonth,
      day: ganZhiDay,
      hour: lunar.getHourInGanZhi(),
      naYin: lunar.getDayNaYin(),
    },
    shengXiao: {
      year: lunar.getYearShengXiao(),
      month: lunar.getMonthShengXiao(),
      day: lunar.getDayShengXiao(),
    },
    festivals,
    chong: {
      description: lunar.getChongDesc(),
      sha: lunar.getSha(),
    },
    pengZu: {
      gan: lunar.getPengZuGan(),
      zhi: lunar.getPengZuZhi(),
    },
    yi: lunar.getDayYi(),
    ji: lunar.getDayJi(),
    jiShen: lunar.getDayJiShen(),
    xiongSha: lunar.getDayXiongSha(),
    tianShen: {
      value: lunar.getTiShen(),
      type: lunar.getTiShenType(),
      typeLuck: lunar.getTiShenTypeLuck(),
    },
    position: {
      xi: lunar.getPositionXi(),
      xiDesc: lunar.getPositionXiDesc(),
      fu: lunar.getPositionFu(),
      fuDesc: lunar.getPositionFuDesc(),
      cai: lunar.getPositionCai(),
      caiDesc: lunar.getPositionCaiDesc(),
      yangGui: lunar.getPositionYangGui(),
      yangGuiDesc: lunar.getPositionYangGuiDesc(),
      yinGui: lunar.getPositionYinGui(),
      yinGuiDesc: lunar.getPositionYinGuiDesc(),
    },
    yiJia: {
      value: lunar.getDayYiJia(),
      naYin: lunar.getDayNaYinYiJia(),
    },
    jieQi: lunar.getJieQi(),
    hourGanZhi: lunar.getHourInGanZhi(),
  };
}

function getZhiXing(solar: Solar): { value: string; description: string } {
  const lunar = solar.getLunar();
  return {
    value: lunar.getZhiXing(),
    description: lunar.getZhiXing(),
  };
}

function getLiuYao(solar: Solar): { value: string; description: string } {
  const lunar = solar.getLunar();
  return {
    value: lunar.getLiuYao(),
    description: lunar.getLiuYao(),
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { date } = req.query;

  try {
    const targetDate = date ? String(date) : undefined;
    const festivalUrl = targetDate
      ? `${FESTIVAL_API}?date=${targetDate}&type=calendar`
      : `${FESTIVAL_API}?type=calendar`;

    const solar = getSolar(targetDate);

    const [festivalRes, fortuneRes] = await Promise.allSettled([
      axios.get<FestivalData>(festivalUrl, { timeout: 10000 }),
      axios.get<FortuneData>(FORTUNE_API, { timeout: 10000 }),
    ]);

    const festival = festivalRes.status === 'fulfilled' ? festivalRes.value.data : null;
    const fortune = fortuneRes.status === 'fulfilled' ? fortuneRes.value.data : null;

    const lunarInfo = getLunarInfo(solar);
    const zhiXing = getZhiXing(solar);
    const liuYao = getLiuYao(solar);

    const result = {
      date: solar.toString(),
      solar: lunarInfo.solar,
      lunar: lunarInfo.lunar,
      ganzhi: lunarInfo.ganzhi,
      shengXiao: lunarInfo.shengXiao,
      festivals: {
        holiday: lunarInfo.festivals,
        lunar: festival?.festival_lunar || '',
        solar: festival?.festival_solar || '',
        computed: festival?.festival_computed || '',
      },
      solarTerm: {
        current: festival?.solar_term || lunarInfo.jieQi,
        displayName: festival?.display_name || '',
        status: fortune?.节气 || '',
      },
      time: {
        shiChen: fortune?.时辰 || lunarInfo.hourGanZhi,
        time: fortune?.时间 || '',
      },
      chong: lunarInfo.chong,
      pengZu: lunarInfo.pengZu,
      yi: lunarInfo.yi,
      ji: lunarInfo.ji,
      jiShen: lunarInfo.jiShen,
      xiongSha: lunarInfo.xiongSha,
      tianShen: lunarInfo.tianShen,
      position: lunarInfo.position,
      zhiXing,
      liuYao,
      fortune: fortune?.星座运势 || null,
      isLeapMonth: lunarInfo.lunar.isLeapMonth,
    };

    res.status(200).json({
      code: 200,
      message: 'success',
      data: result,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Lunar API error:', err.message);
    res.status(200).json({
      code: 500,
      message: 'Lunar calendar service unavailable',
      data: null,
    });
  }
}
