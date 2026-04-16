"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = historyHandler;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const response_1 = require("../../lib/utils/response");
const logger_1 = require("../../lib/core/logger");
async function historyHandler(req, res) {
    const { month, day } = req.query;
    const now = new Date();
    const m = month || String(now.getMonth() + 1);
    const d = day || String(now.getDate());
    const monthStr = String(m).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    try {
        const filePath = path_1.default.join(process.cwd(), 'history_today', `${monthStr}.json`);
        const fileContent = await promises_1.default.readFile(filePath, 'utf-8');
        const data = JSON.parse(fileContent);
        const dateKey = `${monthStr}${dayStr}`;
        const events = data[monthStr]?.[dateKey] || [];
        if (events.length === 0) {
            res.status(200).json((0, response_1.success)([]));
            return;
        }
        const result = events.map((event) => ({
            year: event.year.trim(),
            title: event.title.trim(),
            desc: event.desc.trim(),
            link: event.link,
            date: dateKey,
            type: event.type || '',
            festival: event.festival || '',
        }));
        res.status(200).json((0, response_1.success)(result.slice(0, 50)));
    }
    catch (err) {
        logger_1.logger.error('History failed', err);
        res.status(200).json((0, response_1.error)(503, 'History data unavailable', null));
    }
}
