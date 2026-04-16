"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = news163ToutiaoHotHandler;
const hot_1 = require("../../lib/utils/hot");
const response_1 = require("../../lib/utils/response");
async function news163ToutiaoHotHandler(req, res) {
    const data = await (0, hot_1.getPlatformData)('news163_toutiao');
    res.status(200).json((0, response_1.success)(data || []));
}
