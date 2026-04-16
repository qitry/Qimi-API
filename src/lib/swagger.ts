import swaggerJsdoc from 'swagger-jsdoc';

interface SwaggerPath {
  [method: string]: {
    summary?: string;
    description?: string;
  };
}

interface SwaggerSpec {
  paths?: {
    [path: string]: SwaggerPath;
  };
}

const options: swaggerJsdoc.Options = {
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
          summary: '百度搜索 (不稳定)',
          description: '⚠️ 此接口不稳定，可能随时失效',
          tags: ['unstable'],
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
      '/api/hot/weibo': {
        get: {
          summary: '微博热搜',
          responses: {
            '200': { description: '成功' },
          },
        },
      },
      '/api/hot/baidu': {
        get: {
          summary: '百度热搜',
          responses: {
            '200': { description: '成功' },
          },
        },
      },
      '/api/hot/douyin': {
        get: {
          summary: '抖音热搜',
          responses: {
            '200': { description: '成功' },
          },
        },
      },
      '/api/hot/bilibili': {
        get: {
          summary: 'B站热搜',
          responses: {
            '200': { description: '成功' },
          },
        },
      },
      '/api/hot/zhihu': {
        get: {
          summary: '知乎热搜',
          responses: {
            '200': { description: '成功' },
          },
        },
      },
      '/api/hot/qqnews-hot': {
        get: {
          summary: '腾讯新闻热榜',
          responses: {
            '200': { description: '成功' },
          },
        },
      },
      '/api/hot/qqnews-curation': {
        get: {
          summary: '腾讯新闻精选',
          responses: {
            '200': { description: '成功' },
          },
        },
      },
      '/api/hot/news163-toutiao': {
        get: {
          summary: '网易新闻头条',
          responses: {
            '200': { description: '成功' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options) as SwaggerSpec;
