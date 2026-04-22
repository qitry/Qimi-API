"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = lunarHandler;
const http_1 = __importDefault(require("../../lib/utils/http"));
const lunar_javascript_1 = require("lunar-javascript");
const response_1 = require("../../lib/utils/response");
const logger_1 = require("../../lib/core/logger");
const cache_1 = require("../../lib/utils/cache");
const FESTIVAL_API = 'https://festival2.wifilu.com/';
const FORTUNE_API = 'https://api.suyanw.cn/api/huangli.php';
async function lunarHandler(req, res) {
    const { date } = req.query;
    const targetDate = date
        ? String(date)
        : (() => {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        })();
    const cacheKey = `lunar:${targetDate}`;
    const cached = cache_1.cache.get(cacheKey);
    if (cached) {
        res.status(200).json((0, response_1.success)(cached));
        return;
    }
    try {
        const festivalUrl = `${FESTIVAL_API}?date=${targetDate}&type=calendar`;
        const solar = (() => {
            const parts = targetDate.split('-');
            if (parts.length === 3)
                return lunar_javascript_1.Solar.fromYmd(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
            return lunar_javascript_1.Solar.fromDate(new Date());
        })();
        const lunar = solar.getLunar();
        const [festivalRes, fortuneRes] = await Promise.allSettled([
            http_1.default.get(festivalUrl),
            http_1.default.get(FORTUNE_API),
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
        cache_1.cache.set(cacheKey, result, 60 * 60 * 1000);
        res.status(200).json((0, response_1.success)(result));
    }
    catch (err) {
        logger_1.logger.error('Lunar failed', err);
        res.status(200).json((0, response_1.error)(503, 'Lunar calendar service unavailable', null));
    }
}
