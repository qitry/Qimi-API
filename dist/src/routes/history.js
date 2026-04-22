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
exports.default = historyHandler;
const path_1 = __importDefault(require("path"));
const response_1 = require("../../lib/utils/response");
const logger_1 = require("../../lib/core/logger");
const cache_1 = require("../../lib/utils/cache");
const monthDataCache = new Map();
async function getMonthData(monthStr) {
    if (monthDataCache.has(monthStr)) {
        return monthDataCache.get(monthStr);
    }
    const { readFileSync } = await Promise.resolve().then(() => __importStar(require('fs')));
    try {
        const filePath = path_1.default.join(process.cwd(), 'history_today', `${monthStr}.json`);
        const data = JSON.parse(readFileSync(filePath, 'utf-8'));
        monthDataCache.set(monthStr, data);
        return data;
    }
    catch {
        return null;
    }
}
async function historyHandler(req, res) {
    const { month, day } = req.query;
    const now = new Date();
    const m = month || String(now.getMonth() + 1);
    const d = day || String(now.getDate());
    const monthStr = String(m).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    const dateKey = `${monthStr}${dayStr}`;
    const cached = cache_1.cache.get(`history:${dateKey}`);
    if (cached) {
        res.status(200).json((0, response_1.success)(cached));
        return;
    }
    try {
        const data = await getMonthData(monthStr);
        if (!data) {
            res.status(200).json((0, response_1.error)(503, 'History data unavailable', null));
            return;
        }
        const monthData = data[monthStr];
        const events = monthData?.[dateKey] || [];
        if (events.length === 0) {
            cache_1.cache.set(`history:${dateKey}`, [], 60 * 60 * 1000);
            res.status(200).json((0, response_1.success)([]));
            return;
        }
        const result = events
            .map((event) => ({
            year: event.year.trim(),
            title: event.title.trim(),
            desc: event.desc.trim(),
            link: event.link,
            date: dateKey,
            type: event.type || '',
            festival: event.festival || '',
        }))
            .slice(0, 50);
        cache_1.cache.set(`history:${dateKey}`, result, 60 * 60 * 1000);
        res.status(200).json((0, response_1.success)(result));
    }
    catch (err) {
        logger_1.logger.error('History failed', err);
        res.status(200).json((0, response_1.error)(503, 'History data unavailable', null));
    }
}
