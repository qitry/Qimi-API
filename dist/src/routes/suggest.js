"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = suggestHandler;
const axios_1 = __importDefault(require("axios"));
const response_1 = require("../../lib/utils/response");
const logger_1 = require("../../lib/core/logger");
const BAIDU_SUGGEST_URL = 'https://suggestion.baidu.com/su';
async function suggestHandler(req, res) {
    const q = req.query.q;
    if (!q || typeof q !== 'string') {
        res.status(200).json((0, response_1.error)(400, 'Missing required parameter: q', null));
        return;
    }
    try {
        const response = await axios_1.default.get(BAIDU_SUGGEST_URL, {
            params: { wd: q, action: 'opensearch' },
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
            responseType: 'arraybuffer',
            timeout: 10000,
        });
        const decoder = new TextDecoder('gbk');
        const data = JSON.parse(decoder.decode(response.data));
        if (Array.isArray(data) && Array.isArray(data[1])) {
            res.status(200).json((0, response_1.success)({ query: data[0], suggestions: data[1] }));
            return;
        }
        res.status(200).json((0, response_1.success)({ query: q, suggestions: [] }));
    }
    catch (err) {
        logger_1.logger.error('Suggest failed', err);
        res.status(200).json((0, response_1.error)(503, 'Suggestion service unavailable', null));
    }
}
