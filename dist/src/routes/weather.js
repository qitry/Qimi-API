"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = weatherHandler;
const http_1 = __importDefault(require("../../lib/utils/http"));
const response_1 = require("../../lib/utils/response");
const logger_1 = require("../../lib/core/logger");
const cache_1 = require("../../lib/utils/cache");
const helpers_1 = require("../../lib/utils/helpers");
const helpers_2 = require("../../lib/utils/helpers");
const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const IP_API_BASE_URL = 'http://ip-api.com/json/';
const DEFAULT_LAT = 39.9042;
const DEFAULT_LON = 116.4074;
async function weatherHandler(req, res) {
    const { latitude, longitude, ip, ...rest } = req.query;
    let lat = latitude;
    let lon = longitude;
    if (!lat || !lon) {
        const queryIp = (0, helpers_1.normalizeIp)((ip || (0, helpers_2.getClientIp)(req)));
        if (!(0, helpers_1.isReservedIp)(queryIp)) {
            try {
                const ipRes = await http_1.default.get(`${IP_API_BASE_URL}${queryIp}`);
                if (ipRes.data.status === 'success') {
                    lat = ipRes.data.lat;
                    lon = ipRes.data.lon;
                    res.setHeader('X-Location-City', ipRes.data.city || '');
                }
            }
            catch (err) {
                logger_1.logger.error('Weather IP lookup failed', err);
            }
        }
        if (!lat || !lon) {
            lat = String(DEFAULT_LAT);
            lon = String(DEFAULT_LON);
            res.setHeader('X-Location-City', '北京 (默认)');
            res.setHeader('X-Location-Fallback', 'true');
        }
    }
    const cacheKey = `weather:${lat},${lon}`;
    const cached = cache_1.cache.get(cacheKey);
    if (cached) {
        res.status(200).json((0, response_1.success)(cached));
        return;
    }
    try {
        const response = await http_1.default.get(OPEN_METEO_BASE_URL, {
            params: { latitude: lat, longitude: lon, current_weather: true, ...rest },
        });
        const result = { ...response.data, location: { lat, lon } };
        cache_1.cache.set(cacheKey, result, 10 * 60 * 1000);
        res.status(200).json((0, response_1.success)(result));
    }
    catch (err) {
        logger_1.logger.error('Weather API failed', err);
        res.status(200).json((0, response_1.error)(503, 'Weather service unavailable', null));
    }
}
