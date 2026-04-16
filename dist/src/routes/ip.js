"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ipHandler;
const axios_1 = __importDefault(require("axios"));
const response_1 = require("../../lib/utils/response");
const logger_1 = require("../../lib/core/logger");
const IP_API_BASE_URL = 'http://ip-api.com/json/';
async function ipHandler(req, res) {
    const { query = '', lang = 'zh-CN', ...rest } = req.query;
    try {
        const response = await axios_1.default.get(`${IP_API_BASE_URL}${query}`, {
            params: {
                lang,
                ...rest,
                fields: rest.fields ||
                    'status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query',
            },
        });
        if (response.data.status === 'fail') {
            res.status(200).json((0, response_1.error)(400, 'Query failed', response.data));
            return;
        }
        res.status(200).json((0, response_1.success)(response.data));
    }
    catch (err) {
        logger_1.logger.error('IP lookup failed', err);
        res.status(200).json((0, response_1.error)(500, 'IP lookup failed', null));
    }
}
