"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = hotHandler;
const axios_1 = __importDefault(require("axios"));
const response_1 = require("../../lib/utils/response");
const logger_1 = require("../../lib/core/logger");
const HOT_CACHE = {};
const HOT_CACHE_DURATION = 30 * 60 * 1000;
async function hotHandler(req, res) {
    const { type } = req.query;
    const now = Date.now();
    if (HOT_CACHE.data && HOT_CACHE.timestamp && now - HOT_CACHE.timestamp < HOT_CACHE_DURATION) {
        const data = HOT_CACHE.data;
        if (type && typeof type === 'string') {
            const filtered = data.filter(s => s.alias === type);
            res.status(200).json(filtered.length > 0 ? (0, response_1.success)(filtered[0].data) : (0, response_1.success)(data));
            return;
        }
        res.status(200).json((0, response_1.success)(data));
        return;
    }
    try {
        const response = await axios_1.default.get('https://cdn.lylme.com/api/hot/', {
            timeout: 10000,
            headers: { 'User-Agent': 'qimiapi/1.0' },
        });
        if (response.data?.code === 200 && response.data?.data) {
            HOT_CACHE.data = response.data.data;
            HOT_CACHE.timestamp = now;
            res.status(200).json((0, response_1.success)(response.data.data));
            return;
        }
    }
    catch (err) {
        logger_1.logger.error('Hot failed', err);
    }
    res.status(200).json((0, response_1.success)(HOT_CACHE.data || []));
}
