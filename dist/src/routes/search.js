"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = searchHandler;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const response_1 = require("../../lib/utils/response");
const logger_1 = require("../../lib/core/logger");
const helpers_1 = require("../../lib/utils/helpers");
const LANG_TO_MKT = {
    en: 'en-US',
    zh: 'zh-CN',
    ja: 'ja-JP',
    ko: 'ko-KR',
    fr: 'fr-FR',
    de: 'de-DE',
    es: 'es-ES',
    pt: 'pt-BR',
    ru: 'ru-RU',
    ar: 'ar-XA',
};
async function searchHandler(req, res) {
    const q = req.query.q?.trim();
    const count = Math.min((0, helpers_1.parseInteger)(req.query.count, 10), 50);
    const lang = req.query.lang || 'zh';
    const mkt = LANG_TO_MKT[lang] || 'zh-CN';
    if (!q) {
        res.status(200).json((0, response_1.error)(400, 'Missing required parameter: q', null));
        return;
    }
    try {
        const response = await axios_1.default.get('https://www.bing.com/search', {
            params: { q, count: Math.min(count, 15), mkt, format: 'rss' },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/rss+xml, application/xml, text/xml',
            },
            timeout: 10000,
        });
        const $ = cheerio.load(response.data, { xmlMode: true });
        const items = [];
        $('item').each((_, el) => {
            items.push({
                title: $(el).find('title').text(),
                link: $(el).find('link').text(),
                description: $(el).find('description').text(),
                pubDate: $(el).find('pubDate').text(),
            });
        });
        res.status(200).json((0, response_1.success)({ results: items.slice(0, count), count: items.length }));
    }
    catch (err) {
        logger_1.logger.error('Search failed', err);
        res.status(200).json((0, response_1.error)(503, 'Search service unavailable', null));
    }
}
