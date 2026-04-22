"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = sixtyHandler;
const http_1 = __importDefault(require("../../lib/utils/http"));
const response_1 = require("../../lib/utils/response");
const logger_1 = require("../../lib/core/logger");
const cache_1 = require("../../lib/utils/cache");
const SIXTY_API = 'https://cdn.lylme.com/api/60s/';
const CACHE_TTL = 60 * 60 * 1000;
async function sixtyHandler(req, res) {
    const cacheKey = '60s';
    const cached = cache_1.cache.get(cacheKey);
    if (cached) {
        res.status(200).json((0, response_1.success)(cached));
        return;
    }
    try {
        const response = await http_1.default.get(SIXTY_API, {
            headers: { 'User-Agent': 'qimiapi/1.0' },
        });
        if (response.data?.status === 200 && response.data?.data) {
            cache_1.cache.set(cacheKey, response.data.data, CACHE_TTL);
            res.status(200).json((0, response_1.success)(response.data.data));
            return;
        }
    }
    catch (err) {
        logger_1.logger.error('60s failed', err);
    }
    const stale = cache_1.cache.get(cacheKey);
    res.status(200).json((0, response_1.success)(stale || []));
}
