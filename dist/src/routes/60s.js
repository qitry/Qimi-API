"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = sixtyHandler;
const axios_1 = __importDefault(require("axios"));
const response_1 = require("../../lib/utils/response");
const logger_1 = require("../../lib/core/logger");
const SIXTY_CACHE = {};
const SIXTY_CACHE_DURATION = 60 * 60 * 1000;
async function sixtyHandler(req, res) {
    const now = Date.now();
    if (SIXTY_CACHE.data && SIXTY_CACHE.timestamp && now - SIXTY_CACHE.timestamp < SIXTY_CACHE_DURATION) {
        res.status(200).json((0, response_1.success)(SIXTY_CACHE.data));
        return;
    }
    try {
        const response = await axios_1.default.get('https://cdn.lylme.com/api/60s/', {
            timeout: 10000,
            headers: { 'User-Agent': 'qimiapi/1.0' },
        });
        if (response.data?.status === 200 && response.data?.data) {
            SIXTY_CACHE.data = response.data.data;
            SIXTY_CACHE.timestamp = now;
            res.status(200).json((0, response_1.success)(response.data.data));
            return;
        }
    }
    catch (err) {
        logger_1.logger.error('60s failed', err);
    }
    res.status(200).json((0, response_1.success)(SIXTY_CACHE.data || []));
}
