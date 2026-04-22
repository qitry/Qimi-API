"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeIp = exports.isReservedIp = void 0;
exports.default = ipHandler;
const http_1 = __importDefault(require("../../lib/utils/http"));
const response_1 = require("../../lib/utils/response");
const logger_1 = require("../../lib/core/logger");
const cache_1 = require("../../lib/utils/cache");
const helpers_1 = require("../../lib/utils/helpers");
Object.defineProperty(exports, "normalizeIp", { enumerable: true, get: function () { return helpers_1.normalizeIp; } });
Object.defineProperty(exports, "isReservedIp", { enumerable: true, get: function () { return helpers_1.isReservedIp; } });
const IP_API_BASE_URL = 'http://ip-api.com/json/';
async function ipHandler(req, res) {
    const { query: queryParam = '', lang = 'zh-CN', ...rest } = req.query;
    let query = (queryParam || (0, helpers_1.getClientIp)(req));
    query = (0, helpers_1.normalizeIp)(query);
    if ((0, helpers_1.isReservedIp)(query)) {
        res.status(200).json((0, response_1.error)(400, '无法解析本地/保留 IP，请通过 query 参数指定公网 IP', null));
        return;
    }
    const cacheKey = `ip:${query}:${lang}`;
    const cached = cache_1.cache.get(cacheKey);
    if (cached) {
        res.status(200).json((0, response_1.success)(cached));
        return;
    }
    try {
        const response = await http_1.default.get(`${IP_API_BASE_URL}${query}`, {
            params: {
                lang,
                ...rest,
                fields: rest.fields ||
                    'status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query',
            },
        });
        if (response.data.status === 'fail') {
            res.status(200).json((0, response_1.error)(400, 'Query failed', response.data));
            return;
        }
        cache_1.cache.set(cacheKey, response.data, 5 * 60 * 1000);
        res.status(200).json((0, response_1.success)(response.data));
    }
    catch (err) {
        logger_1.logger.error('IP lookup failed', err);
        res.status(200).json((0, response_1.error)(500, 'IP lookup failed', null));
    }
}
