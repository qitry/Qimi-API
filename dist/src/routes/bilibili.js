"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = bilibiliHandler;
const http_1 = __importDefault(require("../../lib/utils/http"));
const response_1 = require("../../lib/utils/response");
const logger_1 = require("../../lib/core/logger");
const BILIBILI_API = 'https://api.bilibili.com/x/web-interface/ranking/v2';
async function bilibiliHandler(req, res) {
    try {
        const response = await http_1.default.get(BILIBILI_API, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        });
        if (response.data.code !== 0) {
            res.status(200).json((0, response_1.error)(500, 'Hot list unavailable', null));
            return;
        }
        const list = response.data.data.list.map((item, index) => ({
            rank: index + 1,
            aid: item.aid,
            bvid: item.bvid,
            title: item.title,
            url: `https://www.bilibili.com/video/${item.bvid}`,
            cover: item.pic,
            author: item.owner?.name,
            authorFace: item.owner?.face,
            view: item.stat?.view,
            like: item.stat?.like,
            reply: item.stat?.reply,
            favorite: item.stat?.favorite,
            coin: item.stat?.coin,
            duration: item.duration,
            pubdate: item.pubdate,
        }));
        res.status(200).json((0, response_1.success)(list));
    }
    catch (err) {
        logger_1.logger.error('Bilibili failed', err);
        res.status(200).json((0, response_1.error)(500, 'Hot list unavailable', null));
    }
}
