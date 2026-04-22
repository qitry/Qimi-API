"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = baiduSearchHandler;
const http_1 = __importDefault(require("../../lib/utils/http"));
const cheerio = __importStar(require("cheerio"));
const response_1 = require("../../lib/utils/response");
const logger_1 = require("../../lib/core/logger");
const cache_1 = require("../../lib/utils/cache");
const helpers_1 = require("../../lib/utils/helpers");
const BAIDU_SEARCH_URL = 'https://www.baidu.com/s';
async function baiduSearchHandler(req, res) {
    const { q, count = '10' } = req.query;
    if (!q || typeof q !== 'string') {
        res.status(200).json((0, response_1.error)(400, 'Missing required parameter: q', null));
        return;
    }
    const num = Math.min((0, helpers_1.parseInteger)(count, 10), 20);
    const cacheKey = `baidu-search:${q}:${num}`;
    const cached = cache_1.cache.get(cacheKey);
    if (cached) {
        res.status(200).json((0, response_1.success)(cached));
        return;
    }
    try {
        const response = await http_1.default.get(BAIDU_SEARCH_URL, {
            params: { wd: q, rn: num, ie: 'utf-8', inputT: Math.floor(Date.now() / 1000) },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'zh-CN,zh;q=0.9',
            },
            timeout: 15000,
        });
        const $ = cheerio.load(response.data);
        if ($('title').text().includes('安全验证')) {
            res.status(200).json((0, response_1.error)(503, 'Baidu security check triggered, try again later', null));
            return;
        }
        const results = [];
        $('div.result, div.c-result, div.result-op').each((_, el) => {
            const $el = $(el);
            const title = $el.find('h3').first().text().trim() || '';
            const link = $el.find('h3 a').attr('href') || '';
            const description = $el.find('.c-abstract, p').first().text().trim() || '';
            if (title && (link || description)) {
                results.push({ title, link, description: description.substring(0, 300), date: '' });
            }
        });
        const result = {
            query: q,
            results: results.slice(0, num),
            count: results.length,
            source: 'baidu',
            status: 'alpha',
        };
        cache_1.cache.set(cacheKey, result, 10 * 60 * 1000);
        res.status(200).json((0, response_1.success)(result));
    }
    catch (err) {
        logger_1.logger.error('Baidu search failed', err);
        res.status(200).json((0, response_1.error)(503, 'Search service unavailable', null));
    }
}
