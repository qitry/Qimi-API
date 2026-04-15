declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromDate(date: Date): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getWeek(): number;
    getWeekInChinese(): string;
    toString(): string;
    toFullString(): string;
    toYmd(): string;
    getLunar(): Lunar;
  }

  export class Lunar {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    isLeapMonth(): boolean;
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getHourInGanZhi(): string;
    getYearShengXiao(): string;
    getMonthShengXiao(): string;
    getDayShengXiao(): string;
    getDayNaYin(): string;
    getChongDesc(): string;
    getSha(): string;
    getPengZuGan(): string;
    getPengZuZhi(): string;
    getDayYi(): string[];
    getDayJi(): string[];
    getDayJiShen(): string[];
    getDayXiongSha(): string[];
    getTiShen(): string;
    getTiShenType(): string;
    getTiShenTypeLuck(): string;
    getPositionXi(): string;
    getPositionXiDesc(): string;
    getPositionFu(): string;
    getPositionFuDesc(): string;
    getPositionCai(): string;
    getPositionCaiDesc(): string;
    getPositionYangGui(): string;
    getPositionYangGuiDesc(): string;
    getPositionYinGui(): string;
    getPositionYinGuiDesc(): string;
    getDayYiJia(): string;
    getDayNaYinYiJia(): string;
    getZhiXing(): string;
    getLiuYao(): string;
    getJieQi(): string;
  }

  export class HolidayUtil {
    static getHoliday(ymd: string): Holiday | null;
    static getHolidays(ymd: string): Holiday[];
  }

  export class Holiday {
    getName(): string;
    getDay(): string;
    isWork(): boolean;
    getTarget(): string;
  }

  export class FotoFestival {
    constructor(name: string, desc?: string, avoid?: boolean, remark?: string);
  }

  export class TaoFestival {
    constructor(name: string, desc?: string);
  }
}
