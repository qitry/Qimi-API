"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = baiduHandler;
const axios_1 = __importDefault(require("axios"));
const response_1 = require("../../lib/utils/response");
const logger_1 = require("../../lib/core/logger");
const BAIDU_HOT_API = 'https://zj.v.api.aa1.cn/api/baidu-rs/';
async function baiduHandler(req, res) {
    try {
        const response = await axios_1.default.get(BAIDU_HOT_API, { timeout: 10000 });
        if (response.data.code !== 1) {
            res.status(200).json((0, response_1.error)(500, 'Hot list unavailable', null));
            return;
        }
        const items = response.data.data.map((item) => ({
            index: item.index,
            title: item.title,
            hot: item.hot,
            desc: item.desc || '',
            image: item.pic || '',
            url: item.url,
        }));
        res.status(200).json((0, response_1.success)(items));
    }
    catch (err) {
        logger_1.logger.error('Baidu hot failed', err);
        res.status(200).json((0, response_1.error)(500, 'Hot list unavailable', null));
    }
}
