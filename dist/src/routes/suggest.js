"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = suggestHandler;
const http_1 = __importDefault(require("../../lib/utils/http"));
const response_1 = require("../../lib/utils/response");
const logger_1 = require("../../lib/core/logger");
const cache_1 = require("../../lib/utils/cache");
const BAIDU_SUGGEST_URL = 'https://suggestion.baidu.com/su';
async function suggestHandler(req, res) {
    const q = req.query.q;
    if (!q || typeof q !== 'string') {
        res.status(200).json((0, response_1.error)(400, 'Missing required parameter: q', null));
        return;
    }
    const cacheKey = `suggest:${q}`;
    const cached = cache_1.cache.get(cacheKey);
    if (cached) {
        res.status(200).json((0, response_1.success)(cached));
        return;
    }
    try {
        const response = await http_1.default.get(BAIDU_SUGGEST_URL, {
            params: { wd: q, action: 'opensearch' },
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
            responseType: 'arraybuffer',
        });
        const decoder = new TextDecoder('gbk');
        const data = JSON.parse(decoder.decode(response.data));
        if (Array.isArray(data) && Array.isArray(data[1])) {
            const result = { query: data[0], suggestions: data[1] };
            cache_1.cache.set(cacheKey, result, 5 * 60 * 1000);
            res.status(200).json((0, response_1.success)(result));
            return;
        }
        const result = { query: q, suggestions: [] };
        cache_1.cache.set(cacheKey, result, 5 * 60 * 1000);
        res.status(200).json((0, response_1.success)(result));
    }
    catch (err) {
        logger_1.logger.error('Suggest failed', err);
        res.status(200).json((0, response_1.error)(503, 'Suggestion service unavailable', null));
    }
}
