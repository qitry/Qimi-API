"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatformData = getPlatformData;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../core/logger");
const PLATFORM_CACHE = {};
const CACHE_DURATION = 30 * 60 * 1000;
async function getPlatformData(platform) {
    const now = Date.now();
    const cached = PLATFORM_CACHE[platform];
    if (cached?.data && cached?.timestamp && now - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    try {
        const response = await axios_1.default.get('https://cdn.lylme.com/api/hot/', {
            timeout: 10000,
            headers: { 'User-Agent': 'qimiapi/1.0' },
        });
        if (response.data?.code === 200 && response.data?.data) {
            const platformData = response.data.data.find((p) => p.alias === platform);
            if (platformData) {
                PLATFORM_CACHE[platform] = { data: platformData.data, timestamp: now };
                return platformData.data;
            }
        }
    }
    catch (err) {
        logger_1.logger.error(`Platform ${platform} failed`, err);
    }
    return cached?.data || null;
}
