"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = bilibiliHotHandler;
const response_1 = require("../../lib/utils/response");
const hot_1 = require("../../lib/utils/hot");
async function bilibiliHotHandler(req, res) {
    const data = await (0, hot_1.getPlatformData)('bilibili');
    res.status(200).json((0, response_1.success)(data || []));
}
