"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = hotHandler;
const response_1 = require("../../lib/utils/response");
const hot_1 = require("../../lib/utils/hot");
async function hotHandler(req, res) {
    const { type } = req.query;
    if (type && typeof type === 'string') {
        const data = await (0, hot_1.getPlatformData)(type);
        res.status(200).json(data ? (0, response_1.success)(data) : (0, response_1.success)(await (0, hot_1.getAllHotData)()));
        return;
    }
    res.status(200).json((0, response_1.success)(await (0, hot_1.getAllHotData)()));
}
