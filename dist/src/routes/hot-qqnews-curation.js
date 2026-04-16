"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = qqnewsCurationHotHandler;
const hot_1 = require("../../lib/utils/hot");
const response_1 = require("../../lib/utils/response");
async function qqnewsCurationHotHandler(req, res) {
    const data = await (0, hot_1.getPlatformData)('qqnews_curation');
    res.status(200).json((0, response_1.success)(data || []));
}
