"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'QimiAPI',
            version: '1.0.0',
            description: '免费 API 服务集合',
        },
        servers: [
            {
                url: '/',
                description: '当前服务器',
            },
        ],
        paths: {
            '/api/weather': {
                get: {
                    summary: '天气查询',
                    parameters: [
                        {
                            name: 'city',
                            in: 'query',
                            required: false,
                            schema: { type: 'string' },
                            description: '城市名称',
                        },
                    ],
                    responses: {
                        '200': { description: '成功' },
                    },
                },
            },
            '/api/ip': {
                get: {
                    summary: 'IP 归属地查询',
                    parameters: [
                        {
                            name: 'ip',
                            in: 'query',
                            required: false,
                            schema: { type: 'string' },
                            description: 'IP地址',
                        },
                    ],
                    responses: {
                        '200': { description: '成功' },
                    },
                },
            },
            '/api/search': {
                get: {
                    summary: 'Bing 搜索',
                    parameters: [
                        {
                            name: 'q',
                            in: 'query',
                            required: true,
                            schema: { type: 'string' },
                            description: '搜索关键词',
                        },
                    ],
                    responses: {
                        '200': { description: '成功' },
                    },
                },
            },
            '/api/baidu': {
                get: {
                    summary: '百度热搜',
                    responses: {
                        '200': { description: '成功' },
                    },
                },
            },
            '/api/bilibili': {
                get: {
                    summary: 'B站热榜',
                    responses: {
                        '200': { description: '成功' },
                    },
                },
            },
            '/api/history': {
                get: {
                    summary: '历史上的今天',
                    responses: {
                        '200': { description: '成功' },
                    },
                },
            },
            '/api/suggest': {
                get: {
                    summary: '百度搜索建议',
                    parameters: [
                        {
                            name: 'q',
                            in: 'query',
                            required: true,
                            schema: { type: 'string' },
                            description: '搜索关键词',
                        },
                    ],
                    responses: {
                        '200': { description: '成功' },
                    },
                },
            },
            '/api/baidu-search': {
                get: {
                    summary: '百度搜索',
                    parameters: [
                        {
                            name: 'q',
                            in: 'query',
                            required: true,
                            schema: { type: 'string' },
                            description: '搜索关键词',
                        },
                    ],
                    responses: {
                        '200': { description: '成功' },
                    },
                },
            },
            '/api/lunar': {
                get: {
                    summary: '农历黄历',
                    responses: {
                        '200': { description: '成功' },
                    },
                },
            },
            '/api/60s': {
                get: {
                    summary: '60秒读懂世界',
                    responses: {
                        '200': { description: '成功' },
                    },
                },
            },
            '/api/hot': {
                get: {
                    summary: '综合热搜榜',
                    responses: {
                        '200': { description: '成功' },
                    },
                },
            },
        },
    },
    apis: [],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
