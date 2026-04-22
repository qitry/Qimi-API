"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const ApiResponse = (dataRef) => ({
    '200': {
        description: '成功',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        code: { type: 'integer', example: 200 },
                        message: { type: 'string', example: 'success' },
                        data: { $ref: `#/components/schemas/${dataRef}` },
                    },
                },
            },
        },
    },
});
const ApiErrorResponse = () => ({
    '400': {
        description: '请求参数错误',
        content: {
            'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
        },
    },
    '503': {
        description: '服务不可用',
        content: {
            'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
        },
    },
});
const hotListResponse = {
    '200': {
        description: '成功',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        code: { type: 'integer', example: 200 },
                        message: { type: 'string', example: 'success' },
                        data: { type: 'array', items: { $ref: '#/components/schemas/HotItem' } },
                    },
                },
            },
        },
    },
};
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'QimiAPI',
            version: '1.0.0',
            description: '免费 API 服务集合',
        },
        servers: [{ url: '/', description: '当前服务器' }],
        tags: [
            { name: '天气', description: '天气查询' },
            { name: 'IP', description: 'IP 归属地查询' },
            { name: '搜索', description: '搜索引擎接口' },
            { name: '日历', description: '日历/农历相关' },
            { name: '资讯', description: '新闻资讯' },
            { name: '热榜', description: '各平台热搜热榜' },
            { name: '壁纸', description: 'Bing 每日壁纸' },
            { name: '工具', description: '实用工具' },
        ],
        components: {
            schemas: {
                ApiError: {
                    type: 'object',
                    properties: {
                        code: { type: 'integer', description: '业务错误码' },
                        message: { type: 'string', description: '错误信息' },
                        data: { type: 'object', nullable: true },
                    },
                },
                WeatherCurrent: {
                    type: 'object',
                    properties: {
                        temperature: { type: 'number', description: '当前温度 (°C)' },
                        windspeed: { type: 'number', description: '风速 (km/h)' },
                        winddirection: { type: 'number', description: '风向角度' },
                        weathercode: { type: 'integer', description: '天气代码' },
                        time: { type: 'string', description: '观测时间' },
                    },
                },
                WeatherLocation: {
                    type: 'object',
                    properties: {
                        lat: { type: 'string' },
                        lon: { type: 'string' },
                    },
                },
                WeatherData: {
                    type: 'object',
                    properties: {
                        current_weather: { $ref: '#/components/schemas/WeatherCurrent' },
                        location: { $ref: '#/components/schemas/WeatherLocation' },
                    },
                },
                IpData: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        country: { type: 'string' },
                        countryCode: { type: 'string' },
                        region: { type: 'string' },
                        regionName: { type: 'string' },
                        city: { type: 'string' },
                        zip: { type: 'string' },
                        lat: { type: 'number' },
                        lon: { type: 'number' },
                        timezone: { type: 'string' },
                        isp: { type: 'string' },
                        org: { type: 'string' },
                        as: { type: 'string' },
                        query: { type: 'string' },
                    },
                },
                SearchResult: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        link: { type: 'string' },
                        description: { type: 'string' },
                        pubDate: { type: 'string' },
                    },
                },
                SearchData: {
                    type: 'object',
                    properties: {
                        results: { type: 'array', items: { $ref: '#/components/schemas/SearchResult' } },
                        count: { type: 'integer' },
                    },
                },
                BaiduSearchResult: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        link: { type: 'string' },
                        description: { type: 'string' },
                        date: { type: 'string' },
                    },
                },
                BaiduSearchData: {
                    type: 'object',
                    properties: {
                        query: { type: 'string' },
                        results: { type: 'array', items: { $ref: '#/components/schemas/BaiduSearchResult' } },
                        count: { type: 'integer' },
                        source: { type: 'string' },
                        status: { type: 'string' },
                    },
                },
                SuggestData: {
                    type: 'object',
                    properties: {
                        query: { type: 'string' },
                        suggestions: { type: 'array', items: { type: 'string' } },
                    },
                },
                LunarSolar: {
                    type: 'object',
                    properties: {
                        year: { type: 'integer' },
                        month: { type: 'integer' },
                        day: { type: 'integer' },
                        weekday: { type: 'string' },
                    },
                },
                LunarInfo: {
                    type: 'object',
                    properties: {
                        year: { type: 'integer' },
                        month: { type: 'integer' },
                        day: { type: 'integer' },
                        monthName: { type: 'string' },
                        dayName: { type: 'string' },
                        yearShengXiao: { type: 'string' },
                    },
                },
                LunarGanzhi: {
                    type: 'object',
                    properties: {
                        year: { type: 'string' },
                        month: { type: 'string' },
                        day: { type: 'string' },
                        hour: { type: 'string' },
                    },
                },
                LunarData: {
                    type: 'object',
                    properties: {
                        date: { type: 'string' },
                        solar: { $ref: '#/components/schemas/LunarSolar' },
                        lunar: { $ref: '#/components/schemas/LunarInfo' },
                        ganzhi: { $ref: '#/components/schemas/LunarGanzhi' },
                        yi: { type: 'array', items: { type: 'string' } },
                        ji: { type: 'array', items: { type: 'string' } },
                        chong: {
                            type: 'object',
                            properties: { description: { type: 'string' }, sha: { type: 'string' } },
                        },
                        pengZu: {
                            type: 'object',
                            properties: { gan: { type: 'string' }, zhi: { type: 'string' } },
                        },
                        festivals: {
                            type: 'object',
                            properties: {
                                lunar: { type: 'string' },
                                solar: { type: 'string' },
                                solarTerm: { type: 'string' },
                            },
                        },
                        fortune: { type: 'object', nullable: true },
                    },
                },
                HistoryEvent: {
                    type: 'object',
                    properties: {
                        year: { type: 'string' },
                        title: { type: 'string' },
                        desc: { type: 'string' },
                        link: { type: 'string' },
                        date: { type: 'string' },
                        type: { type: 'string' },
                        festival: { type: 'string' },
                    },
                },
                BingImage: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', description: '图片标题' },
                        copyright: { type: 'string', description: '版权/故事描述' },
                        desc: { type: 'string', description: '故事描述' },
                        url: { type: 'string', description: '图片完整 URL (1920x1080)' },
                        url_base: { type: 'string', description: '图片基础 URL' },
                        enddate: { type: 'string', description: '日期 (YYYYMMDD)' },
                    },
                },
                BingData: {
                    type: 'object',
                    properties: {
                        date: { type: 'string', description: '最新日期' },
                        images: { type: 'array', items: { $ref: '#/components/schemas/BingImage' } },
                    },
                },
                ExchangeRateData: {
                    type: 'object',
                    properties: {
                        from: { type: 'string', description: '源货币代码' },
                        to: { type: 'string', description: '目标货币代码' },
                        amount: { type: 'number', description: '金额' },
                        rate: { type: 'number', description: '汇率' },
                        result: { type: 'number', description: '转换结果' },
                        last_updated: { type: 'string', description: '汇率更新时间' },
                    },
                },
                HotItem: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        url: { type: 'string' },
                        hot: { type: 'string' },
                    },
                },
            },
        },
        paths: {
            '/api/weather': {
                get: {
                    tags: ['天气'],
                    summary: '天气查询',
                    description: '根据经纬度或IP获取当前天气，默认使用Open-Meteo数据源',
                    parameters: [
                        { name: 'latitude', in: 'query', required: false, schema: { type: 'string' }, description: '纬度' },
                        { name: 'longitude', in: 'query', required: false, schema: { type: 'string' }, description: '经度' },
                        { name: 'ip', in: 'query', required: false, schema: { type: 'string' }, description: '用于定位的IP地址' },
                    ],
                    responses: { ...ApiResponse('WeatherData'), ...ApiErrorResponse() },
                },
            },
            '/api/ip': {
                get: {
                    tags: ['IP'],
                    summary: 'IP 归属地查询',
                    description: '查询IP地址的地理位置、运营商等信息',
                    parameters: [
                        { name: 'query', in: 'query', required: false, schema: { type: 'string' }, description: 'IP地址，不传则使用请求者IP' },
                        { name: 'lang', in: 'query', required: false, schema: { type: 'string', default: 'zh-CN' }, description: '语言' },
                        { name: 'fields', in: 'query', required: false, schema: { type: 'string' }, description: '返回字段' },
                    ],
                    responses: { ...ApiResponse('IpData'), ...ApiErrorResponse() },
                },
            },
            '/api/search': {
                get: {
                    tags: ['搜索'],
                    summary: 'Bing 搜索',
                    description: '通过Bing搜索引擎获取搜索结果',
                    parameters: [
                        { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: '搜索关键词' },
                        { name: 'count', in: 'query', required: false, schema: { type: 'integer', default: 10, maximum: 50 }, description: '返回结果数量' },
                        { name: 'lang', in: 'query', required: false, schema: { type: 'string', default: 'zh', enum: ['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'ru', 'ar'] }, description: '搜索语言' },
                    ],
                    responses: { ...ApiResponse('SearchData'), ...ApiErrorResponse() },
                },
            },
            '/api/baidu-search': {
                get: {
                    tags: ['搜索'],
                    summary: '百度搜索 (不稳定)',
                    description: '通过百度搜索获取结果，可能触发安全验证导致失败',
                    parameters: [
                        { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: '搜索关键词' },
                        { name: 'count', in: 'query', required: false, schema: { type: 'integer', default: 10, maximum: 20 }, description: '返回结果数量' },
                    ],
                    responses: { ...ApiResponse('BaiduSearchData'), ...ApiErrorResponse() },
                },
            },
            '/api/suggest': {
                get: {
                    tags: ['搜索'],
                    summary: '百度搜索建议',
                    description: '获取百度搜索自动补全建议',
                    parameters: [
                        { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: '搜索关键词前缀' },
                    ],
                    responses: { ...ApiResponse('SuggestData'), ...ApiErrorResponse() },
                },
            },
            '/api/lunar': {
                get: {
                    tags: ['日历'],
                    summary: '农历黄历',
                    description: '获取指定日期的农历、干支、宜忌、节日等信息',
                    parameters: [
                        { name: 'date', in: 'query', required: false, schema: { type: 'string', format: 'date' }, description: '日期 (YYYY-MM-DD)，默认今天' },
                    ],
                    responses: { ...ApiResponse('LunarData'), ...ApiErrorResponse() },
                },
            },
            '/api/history': {
                get: {
                    tags: ['日历'],
                    summary: '历史上的今天',
                    description: '获取历史上同一天发生的重大事件',
                    parameters: [
                        { name: 'month', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 12 }, description: '月份' },
                        { name: 'day', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 31 }, description: '日期' },
                    ],
                    responses: { ...ApiResponse('HistoryEvent'), ...ApiErrorResponse() },
                },
            },
            '/api/60s': {
                get: {
                    tags: ['资讯'],
                    summary: '60秒读懂世界',
                    description: '每日新闻简报，包含当天重要新闻摘要',
                    responses: {
                        '200': {
                            description: '成功',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            code: { type: 'integer', example: 200 },
                                            message: { type: 'string', example: 'success' },
                                            data: { type: 'array', items: { type: 'string' } },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/api/bing': {
                get: {
                    tags: ['壁纸'],
                    summary: 'Bing 每日壁纸 & 故事',
                    description: '获取Bing首页每日高清壁纸及背后的故事',
                    parameters: [
                        { name: 'n', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 8, default: 1 }, description: '返回数量' },
                        { name: 'idx', in: 'query', required: false, schema: { type: 'integer', minimum: 0, maximum: 7, default: 0 }, description: '偏移天数 (0=今天)' },
                    ],
                    responses: { ...ApiResponse('BingData'), ...ApiErrorResponse() },
                },
            },
            '/api/qrcode': {
                get: {
                    tags: ['工具'],
                    summary: '二维码生成',
                    description: '将文本或URL生成二维码图片，可直接用于 img 标签',
                    parameters: [
                        { name: 'text', in: 'query', required: true, schema: { type: 'string' }, description: '需要编码的文本或URL' },
                        { name: 'size', in: 'query', required: false, schema: { type: 'integer', minimum: 50, maximum: 1000, default: 300 }, description: '图片尺寸 (px)' },
                        { name: 'format', in: 'query', required: false, schema: { type: 'string', enum: ['png', 'svg'], default: 'png' }, description: '输出格式' },
                        { name: 'margin', in: 'query', required: false, schema: { type: 'integer', minimum: 0, maximum: 50, default: 4 }, description: '边距' },
                    ],
                    responses: {
                        '200': {
                            description: '二维码图片',
                            content: {
                                'image/png': { schema: { type: 'string', format: 'binary' } },
                                'image/svg+xml': { schema: { type: 'string', format: 'binary' } },
                            },
                        },
                        '400': {
                            description: '参数错误',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
                        },
                    },
                },
            },
            '/api/exchange-rate': {
                get: {
                    tags: ['工具'],
                    summary: '汇率转换',
                    description: '查询实时汇率并进行货币转换',
                    parameters: [
                        { name: 'from', in: 'query', required: false, schema: { type: 'string', default: 'USD' }, description: '源货币代码' },
                        { name: 'to', in: 'query', required: false, schema: { type: 'string', default: 'CNY' }, description: '目标货币代码' },
                        { name: 'amount', in: 'query', required: false, schema: { type: 'number', minimum: 0, default: 1 }, description: '转换金额' },
                    ],
                    responses: { ...ApiResponse('ExchangeRateData'), ...ApiErrorResponse() },
                },
            },
            '/api/hot/weibo': { get: { tags: ['热榜'], summary: '微博热搜', responses: hotListResponse } },
            '/api/hot/baidu': { get: { tags: ['热榜'], summary: '百度热搜', responses: hotListResponse } },
            '/api/hot/douyin': { get: { tags: ['热榜'], summary: '抖音热搜', responses: hotListResponse } },
            '/api/hot/bilibili': { get: { tags: ['热榜'], summary: 'B站热搜', responses: hotListResponse } },
            '/api/hot/zhihu': { get: { tags: ['热榜'], summary: '知乎热搜', responses: hotListResponse } },
            '/api/hot/qqnews-hot': { get: { tags: ['热榜'], summary: '腾讯新闻热榜', responses: hotListResponse } },
            '/api/hot/qqnews-curation': { get: { tags: ['热榜'], summary: '腾讯新闻精选', responses: hotListResponse } },
            '/api/hot/news163-toutiao': { get: { tags: ['热榜'], summary: '网易新闻头条', responses: hotListResponse } },
        },
    },
    apis: [],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
