"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatformData = getPlatformData;
exports.getAllHotData = getAllHotData;
const logger_1 = require("../core/logger");
const cache_1 = require("./cache");
const http_1 = __importDefault(require("./http"));
const HOT_API = 'https://cdn.lylme.com/api/hot/';
const CACHE_TTL = 30 * 60 * 1000;
async function fetchAllHotData() {
    return cache_1.cache.getOrSet('__hot_all', async () => {
        const response = await http_1.default.get(HOT_API, {
            headers: { 'User-Agent': 'qimiapi/1.0' },
        });
        if (response.data?.code === 200 && response.data?.data) {
            return response.data.data;
        }
        return [];
    }, CACHE_TTL);
}
async function getPlatformData(platform) {
    try {
        const allData = await fetchAllHotData();
        const found = allData.find((p) => p.alias === platform);
        return found ? found.data : null;
    }
    catch (err) {
        logger_1.logger.error(`Platform ${platform} failed`, err);
        return null;
    }
}
async function getAllHotData() {
    try {
        return await fetchAllHotData();
    }
    catch (err) {
        logger_1.logger.error('Hot fetch failed', err);
        return [];
    }
}
