"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = weatherHandler;
const axios_1 = __importDefault(require("axios"));
const response_1 = require("../../lib/utils/response");
const logger_1 = require("../../lib/core/logger");
const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const IP_API_BASE_URL = 'http://ip-api.com/json/';
async function weatherHandler(req, res) {
    const { latitude, longitude, ip, ...rest } = req.query;
    let lat = latitude;
    let lon = longitude;
    if (!lat || !lon) {
        const clientIp = ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        const ipStr = Array.isArray(clientIp) ? clientIp[0] : clientIp;
        try {
            const ipRes = await axios_1.default.get(`${IP_API_BASE_URL}${ipStr === '::1' || ipStr === '127.0.0.1' ? '' : ipStr}`);
            if (ipRes.data.status === 'success') {
                lat = ipRes.data.lat;
                lon = ipRes.data.lon;
                res.setHeader('X-Location-City', ipRes.data.city || '');
            }
            else {
                res.status(200).json((0, response_1.error)(400, 'IP 定位失败', null));
                return;
            }
        }
        catch (err) {
            logger_1.logger.error('Weather IP lookup failed', err);
            res.status(200).json((0, response_1.error)(500, '定位服务不可用', null));
            return;
        }
    }
    try {
        const response = await axios_1.default.get(OPEN_METEO_BASE_URL, {
            params: { latitude: lat, longitude: lon, current_weather: true, ...rest },
        });
        res.status(200).json((0, response_1.success)({ ...response.data, location: { lat, lon } }));
    }
    catch (err) {
        logger_1.logger.error('Weather API failed', err);
        res.status(200).json((0, response_1.error)(503, 'Weather service unavailable', null));
    }
}
