import swaggerJsdoc from 'swagger-jsdoc';

interface SwaggerPath {
  [method: string]: {
    summary?: string;
    description?: string;
    tags?: string[];
    parameters?: unknown[];
    responses?: unknown;
  };
}

interface SwaggerSpec {
  paths?: {
    [path: string]: SwaggerPath;
  };
}

const ApiResponse = (dataRef: string) => ({
  '200': {
    description: '成功',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'success' },
            data: { $ref: `#/components/schemas/${dataRef}` },
          },
        },
      },
    },
  },
});

const ApiErrorResponse = () => ({
  '400': {
    description: '请求参数错误',
    content: {
      'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
    },
  },
  '503': {
    description: '服务不可用',
    content: {
      'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
    },
  },
});

const hotListResponse = {
  '200': {
    description: '成功',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'success' },
            data: { type: 'array', items: { $ref: '#/components/schemas/HotItem' } },
          },
        },
      },
    },
  },
};

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'QimiAPI',
      version: '1.0.0',
      description: '免费 API 服务集合',
    },
    servers: [{ url: '/', description: '当前服务器' }],
    tags: [
      { name: '天气', description: '天气查询' },
      { name: 'IP', description: 'IP 归属地查询' },
      { name: '日历', description: '日历/农历相关' },
      { name: '资讯', description: '新闻资讯' },
      { name: '热榜', description: '各平台热搜热榜' },
      { name: '壁纸', description: 'Bing 每日壁纸' },
      { name: '工具', description: '实用工具' },
      { name: '文本处理', description: '文本编解码和转换' },
      { name: '网络工具', description: '网络检测和诊断' },
      { name: '娱乐', description: '娱乐和励志内容' },
      { name: 'Minecraft', description: 'Minecraft 游戏相关 API' },
    ],
    components: {
      schemas: {
        ApiError: {
          type: 'object',
          properties: {
            code: { type: 'integer', description: '业务错误码' },
            message: { type: 'string', description: '错误信息' },
            data: { type: 'object', nullable: true },
          },
        },
        WeatherCurrent: {
          type: 'object',
          properties: {
            temperature: { type: 'number', description: '当前温度 (°C)' },
            windspeed: { type: 'number', description: '风速 (km/h)' },
            winddirection: { type: 'number', description: '风向角度' },
            weathercode: { type: 'integer', description: '天气代码' },
            time: { type: 'string', description: '观测时间' },
          },
        },
        WeatherLocation: {
          type: 'object',
          properties: {
            lat: { type: 'string' },
            lon: { type: 'string' },
          },
        },
        WeatherData: {
          type: 'object',
          properties: {
            current_weather: { $ref: '#/components/schemas/WeatherCurrent' },
            location: { $ref: '#/components/schemas/WeatherLocation' },
          },
        },
        IpData: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            country: { type: 'string' },
            countryCode: { type: 'string' },
            region: { type: 'string' },
            regionName: { type: 'string' },
            city: { type: 'string' },
            zip: { type: 'string' },
            lat: { type: 'number' },
            lon: { type: 'number' },
            timezone: { type: 'string' },
            isp: { type: 'string' },
            org: { type: 'string' },
            as: { type: 'string' },
            query: { type: 'string' },
          },
        },
        LunarSolar: {
          type: 'object',
          properties: {
            year: { type: 'integer' },
            month: { type: 'integer' },
            day: { type: 'integer' },
            weekday: { type: 'string' },
          },
        },
        LunarInfo: {
          type: 'object',
          properties: {
            year: { type: 'integer' },
            month: { type: 'integer' },
            day: { type: 'integer' },
            monthName: { type: 'string' },
            dayName: { type: 'string' },
            yearShengXiao: { type: 'string' },
          },
        },
        LunarGanzhi: {
          type: 'object',
          properties: {
            year: { type: 'string' },
            month: { type: 'string' },
            day: { type: 'string' },
            hour: { type: 'string' },
          },
        },
        LunarData: {
          type: 'object',
          properties: {
            date: { type: 'string' },
            solar: { $ref: '#/components/schemas/LunarSolar' },
            lunar: { $ref: '#/components/schemas/LunarInfo' },
            ganzhi: { $ref: '#/components/schemas/LunarGanzhi' },
            yi: { type: 'array', items: { type: 'string' } },
            ji: { type: 'array', items: { type: 'string' } },
            chong: {
              type: 'object',
              properties: { description: { type: 'string' }, sha: { type: 'string' } },
            },
            pengZu: {
              type: 'object',
              properties: { gan: { type: 'string' }, zhi: { type: 'string' } },
            },
            festivals: {
              type: 'object',
              properties: {
                lunar: { type: 'string' },
                solar: { type: 'string' },
                solarTerm: { type: 'string' },
              },
            },
            fortune: { type: 'object', nullable: true },
          },
        },
        HistoryEvent: {
          type: 'object',
          properties: {
            year: { type: 'string' },
            title: { type: 'string' },
            desc: { type: 'string' },
            link: { type: 'string' },
            date: { type: 'string' },
            type: { type: 'string' },
            festival: { type: 'string' },
          },
        },
        BingImage: {
          type: 'object',
          properties: {
            title: { type: 'string', description: '图片标题' },
            copyright: { type: 'string', description: '版权/故事描述' },
            desc: { type: 'string', description: '故事描述' },
            url: { type: 'string', description: '图片完整 URL (1920x1080)' },
            url_base: { type: 'string', description: '图片基础 URL' },
            enddate: { type: 'string', description: '日期 (YYYYMMDD)' },
          },
        },
        BingData: {
          type: 'object',
          properties: {
            date: { type: 'string', description: '最新日期' },
            images: { type: 'array', items: { $ref: '#/components/schemas/BingImage' } },
          },
        },
        ExchangeRateData: {
          type: 'object',
          properties: {
            from: { type: 'string', description: '源货币代码' },
            to: { type: 'string', description: '目标货币代码' },
            amount: { type: 'number', description: '金额' },
            rate: { type: 'number', description: '汇率' },
            result: { type: 'number', description: '转换结果' },
            last_updated: { type: 'string', description: '汇率更新时间' },
          },
        },
        HotItem: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            url: { type: 'string' },
            hot: { type: 'string' },
          },
        },
        RegexResult: {
          type: 'object',
          properties: {
            pattern: { type: 'string', description: '正则表达式' },
            description: { type: 'string', description: '描述' },
            text: { type: 'string', description: '测试文本' },
            isValid: { type: 'boolean', description: '是否匹配' },
            matches: { type: 'array', items: { type: 'string' }, description: '匹配结果' },
            matchCount: { type: 'integer', description: '匹配数量' },
          },
        },
        UnitResult: {
          type: 'object',
          properties: {
            value: { type: 'number', description: '原始值' },
            from: { type: 'string', description: '原始值和单位' },
            to: { type: 'string', description: '转换结果' },
            result: { type: 'number', description: '转换数值' },
            unit: { type: 'string', description: '目标单位' },
          },
        },
        PasswordResult: {
          type: 'object',
          properties: {
            password: { type: 'string', description: '生成的密码' },
            length: { type: 'integer', description: '密码长度' },
            strength: { type: 'string', description: '密码强度' },
            options: {
              type: 'object',
              properties: {
                uppercase: { type: 'boolean' },
                lowercase: { type: 'boolean' },
                numbers: { type: 'boolean' },
                symbols: { type: 'boolean' },
              },
            },
          },
        },
        ColorResult: {
          type: 'object',
          properties: {
            hex: { type: 'string', description: 'HEX 格式' },
            rgb: { type: 'string', description: 'RGB 格式' },
            hsl: { type: 'string', description: 'HSL 格式' },
          },
        },
        PingResult: {
          type: 'object',
          properties: {
            host: { type: 'string', description: '主机地址' },
            transmitted: { type: 'integer', description: '发送包数' },
            received: { type: 'integer', description: '接收包数' },
            loss: { type: 'string', description: '丢包率' },
            statistics: {
              type: 'object',
              properties: {
                min: { type: 'string', description: '最小延迟' },
                avg: { type: 'string', description: '平均延迟' },
                max: { type: 'string', description: '最大延迟' },
              },
            },
          },
        },
        DnsResult: {
          type: 'object',
          properties: {
            domain: { type: 'string', description: '域名' },
            type: { type: 'string', description: '记录类型' },
            records: { type: 'array', items: { type: 'string' }, description: 'DNS 记录' },
            count: { type: 'integer', description: '记录数量' },
          },
        },
        QuoteResult: {
          type: 'object',
          properties: {
            quote: { type: 'string', description: '一言内容' },
            index: { type: 'integer', description: '索引' },
            total: { type: 'integer', description: '总数量' },
            date: { type: 'string', description: '日期' },
          },
        },
        AvatarInfo: {
          type: 'object',
          properties: {
            url: { type: 'string', description: '头像图片 URL' },
            style: { type: 'string', description: '头像风格' },
            size: { type: 'integer', description: '头像尺寸 (px)' },
            seed: { type: 'string', description: '生成种子' },
          },
        },
        AbstractAvatarInfo: {
          type: 'object',
          properties: {
            svg: { type: 'string', description: 'SVG 头像代码' },
            seed: { type: 'string', description: '生成种子' },
            colors: { type: 'array', items: { type: 'string' }, description: '使用的颜色列表' },
          },
        },
        McPlayerProfile: {
          type: 'object',
          properties: {
            uuid: { type: 'string', description: '玩家 UUID（带连字符）' },
            name: { type: 'string', description: '玩家名' },
          },
        },
        McNameEntry: {
          type: 'object',
          properties: {
            name: { type: 'string', description: '玩家名' },
            changedToAt: { type: 'integer', description: '修改时间戳（毫秒），null 表示当前名称' },
          },
        },
        McSkinData: {
          type: 'object',
          properties: {
            name: { type: 'string', description: '玩家名' },
            uuid: { type: 'string', description: '玩家 UUID' },
            timestamp: { type: 'integer', nullable: true, description: '皮肤更新时间戳' },
            skin: {
              type: 'object',
              nullable: true,
              properties: {
                url: { type: 'string', description: '皮肤图片 URL' },
                model: { type: 'string', enum: ['default', 'slim'], description: '皮肤模型类型' },
              },
            },
            cape: {
              type: 'object',
              nullable: true,
              properties: {
                url: { type: 'string', description: '披风图片 URL' },
              },
            },
          },
        },
      },
    },
    paths: {
      '/api/weather': {
        get: {
          tags: ['天气'],
          summary: '天气查询',
          description: '根据经纬度或IP获取当前天气，默认使用Open-Meteo数据源',
          parameters: [
            { name: 'latitude', in: 'query', required: false, schema: { type: 'string' }, description: '纬度' },
            { name: 'longitude', in: 'query', required: false, schema: { type: 'string' }, description: '经度' },
            { name: 'ip', in: 'query', required: false, schema: { type: 'string' }, description: '用于定位的IP地址' },
          ],
          responses: { ...ApiResponse('WeatherData'), ...ApiErrorResponse() },
        },
      },
      '/api/ip': {
        get: {
          tags: ['IP'],
          summary: 'IP 归属地查询',
          description: '查询IP地址的地理位置、运营商等信息',
          parameters: [
            { name: 'query', in: 'query', required: false, schema: { type: 'string' }, description: 'IP地址，不传则使用请求者IP' },
            { name: 'lang', in: 'query', required: false, schema: { type: 'string', default: 'zh-CN' }, description: '语言' },
            { name: 'fields', in: 'query', required: false, schema: { type: 'string' }, description: '返回字段' },
          ],
          responses: { ...ApiResponse('IpData'), ...ApiErrorResponse() },
        },
      },
      '/api/lunar': {
        get: {
          tags: ['日历'],
          summary: '农历黄历',
          description: '获取指定日期的农历、干支、宜忌、节日等信息',
          parameters: [
            { name: 'date', in: 'query', required: false, schema: { type: 'string', format: 'date' }, description: '日期 (YYYY-MM-DD)，默认今天' },
          ],
          responses: { ...ApiResponse('LunarData'), ...ApiErrorResponse() },
        },
      },
      '/api/history': {
        get: {
          tags: ['日历'],
          summary: '历史上的今天',
          description: '获取历史上同一天发生的重大事件',
          parameters: [
            { name: 'month', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 12 }, description: '月份' },
            { name: 'day', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 31 }, description: '日期' },
          ],
          responses: { ...ApiResponse('HistoryEvent'), ...ApiErrorResponse() },
        },
      },
      '/api/60s': {
        get: {
          tags: ['资讯'],
          summary: '60秒读懂世界',
          description: '每日新闻简报，包含当天重要新闻摘要',
          responses: {
            '200': {
              description: '成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      code: { type: 'integer', example: 200 },
                      message: { type: 'string', example: 'success' },
                      data: { type: 'array', items: { type: 'string' } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/bing': {
        get: {
          tags: ['壁纸'],
          summary: 'Bing 每日壁纸 & 故事',
          description: '获取Bing首页每日高清壁纸及背后的故事',
          parameters: [
            { name: 'n', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 8, default: 1 }, description: '返回数量' },
            { name: 'idx', in: 'query', required: false, schema: { type: 'integer', minimum: 0, maximum: 7, default: 0 }, description: '偏移天数 (0=今天)' },
          ],
          responses: { ...ApiResponse('BingData'), ...ApiErrorResponse() },
        },
      },
      '/api/qrcode': {
        get: {
          tags: ['工具'],
          summary: '二维码生成',
          description: '将文本或URL生成二维码图片，可直接用于 img 标签',
          parameters: [
            { name: 'text', in: 'query', required: true, schema: { type: 'string' }, description: '需要编码的文本或URL' },
            { name: 'size', in: 'query', required: false, schema: { type: 'integer', minimum: 50, maximum: 1000, default: 300 }, description: '图片尺寸 (px)' },
            { name: 'format', in: 'query', required: false, schema: { type: 'string', enum: ['png', 'svg'], default: 'png' }, description: '输出格式' },
            { name: 'margin', in: 'query', required: false, schema: { type: 'integer', minimum: 0, maximum: 50, default: 4 }, description: '边距' },
          ],
          responses: {
            '200': {
              description: '二维码图片',
              content: {
                'image/png': { schema: { type: 'string', format: 'binary' } },
                'image/svg+xml': { schema: { type: 'string', format: 'binary' } },
              },
            },
            '400': {
              description: '参数错误',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
            },
          },
        },
      },
      '/api/exchange-rate': {
        get: {
          tags: ['工具'],
          summary: '汇率转换',
          description: '查询实时汇率并进行货币转换',
          parameters: [
            { name: 'from', in: 'query', required: false, schema: { type: 'string', default: 'USD' }, description: '源货币代码' },
            { name: 'to', in: 'query', required: false, schema: { type: 'string', default: 'CNY' }, description: '目标货币代码' },
            { name: 'amount', in: 'query', required: false, schema: { type: 'number', minimum: 0, default: 1 }, description: '转换金额' },
          ],
          responses: { ...ApiResponse('ExchangeRateData'), ...ApiErrorResponse() },
        },
      },
      '/api/hot/weibo': { get: { tags: ['热榜'], summary: '微博热搜', responses: hotListResponse } },
      '/api/hot/baidu': { get: { tags: ['热榜'], summary: '百度热搜', responses: hotListResponse } },
      '/api/hot/douyin': { get: { tags: ['热榜'], summary: '抖音热搜', responses: hotListResponse } },
      '/api/hot/bilibili': { get: { tags: ['热榜'], summary: 'B站热搜', responses: hotListResponse } },
      '/api/hot/zhihu': { get: { tags: ['热榜'], summary: '知乎热搜', responses: hotListResponse } },
      '/api/hot/qqnews-hot': { get: { tags: ['热榜'], summary: '腾讯新闻热榜', responses: hotListResponse } },
      '/api/hot/qqnews-curation': { get: { tags: ['热榜'], summary: '腾讯新闻精选', responses: hotListResponse } },
      '/api/hot/news163-toutiao': { get: { tags: ['热榜'], summary: '网易新闻头条', responses: hotListResponse } },
      '/api/base64': {
        get: {
          tags: ['文本处理'],
          summary: 'Base64 编解码',
          description: '对文本进行 Base64 编码或解码',
          parameters: [
            { name: 'action', in: 'query', required: true, schema: { type: 'string', enum: ['encode', 'decode'] }, description: '操作类型' },
            { name: 'text', in: 'query', required: true, schema: { type: 'string' }, description: '要处理的文本' },
          ],
          responses: { ...ApiResponse('string'), ...ApiErrorResponse() },
        },
      },
      '/api/timestamp': {
        get: {
          tags: ['工具'],
          summary: '时间戳转换',
          description: '时间戳与日期格式互转',
          parameters: [
            { name: 'timestamp', in: 'query', required: false, schema: { type: 'string' }, description: '时间戳，不传则返回当前时间戳' },
            { name: 'format', in: 'query', required: false, schema: { type: 'string', default: 'YYYY-MM-DD HH:mm:ss' }, description: '日期格式' },
          ],
          responses: { ...ApiResponse('string'), ...ApiErrorResponse() },
        },
      },
      '/api/regex': {
        get: {
          tags: ['文本处理'],
          summary: '正则表达式测试',
          description: '测试正则表达式匹配，支持常用预设',
          parameters: [
            { name: 'preset', in: 'query', required: false, schema: { type: 'string', enum: ['email', 'phone', 'url', 'idCard', 'ipv4', 'chinese', 'number', 'username', 'password'] }, description: '预设正则' },
            { name: 'pattern', in: 'query', required: false, schema: { type: 'string' }, description: '自定义正则表达式' },
            { name: 'text', in: 'query', required: false, schema: { type: 'string' }, description: '要测试的文本' },
          ],
          responses: { ...ApiResponse('RegexResult'), ...ApiErrorResponse() },
        },
      },
      '/api/unit': {
        get: {
          tags: ['工具'],
          summary: '单位换算',
          description: '长度、重量、温度、数据存储单位换算',
          parameters: [
            { name: 'type', in: 'query', required: true, schema: { type: 'string', enum: ['length', 'weight', 'temperature', 'data'] }, description: '单位类型' },
            { name: 'value', in: 'query', required: true, schema: { type: 'number' }, description: '数值' },
            { name: 'from', in: 'query', required: true, schema: { type: 'string' }, description: '原单位' },
            { name: 'to', in: 'query', required: true, schema: { type: 'string' }, description: '目标单位' },
          ],
          responses: { ...ApiResponse('UnitResult'), ...ApiErrorResponse() },
        },
      },
      '/api/password': {
        get: {
          tags: ['工具'],
          summary: '密码生成器',
          description: '生成随机密码，可配置字符类型和长度',
          parameters: [
            { name: 'length', in: 'query', required: false, schema: { type: 'integer', minimum: 4, maximum: 128, default: 12 }, description: '密码长度' },
            { name: 'uppercase', in: 'query', required: false, schema: { type: 'boolean', default: true }, description: '包含大写字母' },
            { name: 'lowercase', in: 'query', required: false, schema: { type: 'boolean', default: true }, description: '包含小写字母' },
            { name: 'numbers', in: 'query', required: false, schema: { type: 'boolean', default: true }, description: '包含数字' },
            { name: 'symbols', in: 'query', required: false, schema: { type: 'boolean', default: true }, description: '包含特殊字符' },
          ],
          responses: { ...ApiResponse('PasswordResult'), ...ApiErrorResponse() },
        },
      },
      '/api/color': {
        get: {
          tags: ['工具'],
          summary: '颜色转换',
          description: 'HEX/RGB/HSL 颜色格式互转',
          parameters: [
            { name: 'color', in: 'query', required: true, schema: { type: 'string' }, description: '颜色值' },
            { name: 'format', in: 'query', required: false, schema: { type: 'string', enum: ['hex', 'rgb', 'hsl', 'all'], default: 'all' }, description: '输出格式' },
          ],
          responses: { ...ApiResponse('ColorResult'), ...ApiErrorResponse() },
        },
      },
      '/api/ping': {
        get: {
          tags: ['网络工具'],
          summary: 'Ping 检测',
          description: '检测主机连通性和延迟',
          parameters: [
            { name: 'host', in: 'query', required: true, schema: { type: 'string' }, description: '主机地址' },
            { name: 'count', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 10, default: 4 }, description: 'ping 次数' },
          ],
          responses: { ...ApiResponse('PingResult'), ...ApiErrorResponse() },
        },
      },
      '/api/dns': {
        get: {
          tags: ['网络工具'],
          summary: 'DNS 解析',
          description: '查询域名 DNS 记录',
          parameters: [
            { name: 'domain', in: 'query', required: true, schema: { type: 'string' }, description: '域名' },
            { name: 'type', in: 'query', required: false, schema: { type: 'string', default: 'A' }, description: '记录类型 (A, AAAA, MX, TXT, CNAME)' },
          ],
          responses: { ...ApiResponse('DnsResult'), ...ApiErrorResponse() },
        },
      },
      '/api/quote': {
        get: {
          tags: ['娱乐'],
          summary: '每日一言',
          description: '随机获取一句励志或优美的话语',
          responses: { ...ApiResponse('QuoteResult'), ...ApiErrorResponse() },
        },
      },
      '/api/avatar': {
        get: {
          tags: ['工具'],
          summary: '随机头像生成',
          description: '根据种子字符串生成随机头像，支持多种风格',
          parameters: [
            { name: 'seed', in: 'query', required: false, schema: { type: 'string', default: 'default' }, description: '生成种子（可以是名字、ID等）' },
            { name: 'style', in: 'query', required: false, schema: { type: 'string', enum: ['uiavatars', 'dicebear-avataaars', 'dicebear-initials', 'dicebear-bottts', 'robohash'], default: 'dicebear-avataaars' }, description: '头像风格' },
            { name: 'size', in: 'query', required: false, schema: { type: 'integer', minimum: 50, maximum: 1000, default: 200 }, description: '头像尺寸 (px)' },
            { name: 'output', in: 'query', required: false, schema: { type: 'string', enum: ['json', 'image'], default: 'json' }, description: '输出类型' },
          ],
          responses: {
            '200': {
              description: '成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      code: { type: 'integer', example: 200 },
                      message: { type: 'string', example: 'success' },
                      data: { $ref: '#/components/schemas/AvatarInfo' },
                    },
                  },
                },
                'image/svg+xml': { schema: { type: 'string', format: 'binary' } },
                'image/png': { schema: { type: 'string', format: 'binary' } },
              },
            },
            '400': {
              description: '参数错误',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
            },
          },
        },
      },
      '/api/abstract-avatar': {
        get: {
          tags: ['工具'],
          summary: '随机抽象头像生成',
          description: '基于算法生成随机的抽象头像，类似 GitHub identicon 或 Gravatar 默认头像风格',
          parameters: [
            { name: 'seed', in: 'query', required: true, schema: { type: 'string', maxLength: 64 }, description: '生成种子（可以是邮箱、用户名、ID等）' },
            { name: 'output', in: 'query', required: false, schema: { type: 'string', enum: ['json', 'image'], default: 'json' }, description: '输出类型' },
          ],
          responses: {
            '200': {
              description: '成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      code: { type: 'integer', example: 200 },
                      message: { type: 'string', example: 'success' },
                      data: { $ref: '#/components/schemas/AbstractAvatarInfo' },
                    },
                  },
                },
                'image/svg+xml': { schema: { type: 'string', format: 'binary' } },
              },
            },
            '400': {
              description: '参数错误',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
            },
          },
        },
      },
      '/api/minecraft/player': {
        get: {
          tags: ['Minecraft'],
          summary: '玩家 UUID 查询',
          description: '通过玩家名查询 Mojang 正版 UUID',
          parameters: [
            { name: 'username', in: 'query', required: true, schema: { type: 'string' }, description: 'Minecraft 玩家名' },
          ],
          responses: { ...ApiResponse('McPlayerProfile'), ...ApiErrorResponse() },
        },
      },
      '/api/minecraft/names': {
        get: {
          tags: ['Minecraft'],
          summary: '玩家历史名称查询',
          description: '通过 UUID 查询玩家的历史名称记录',
          parameters: [
            { name: 'uuid', in: 'query', required: true, schema: { type: 'string' }, description: '玩家 UUID（带或不带连字符均可）' },
          ],
          responses: { ...ApiResponse('McNameEntry'), ...ApiErrorResponse() },
        },
      },
      '/api/minecraft/skin': {
        get: {
          tags: ['Minecraft'],
          summary: '玩家皮肤/披风查询',
          description: '通过 UUID 获取玩家的皮肤和披风 URL',
          parameters: [
            { name: 'uuid', in: 'query', required: true, schema: { type: 'string' }, description: '玩家 UUID（带或不带连字符均可）' },
          ],
          responses: { ...ApiResponse('McSkinData'), ...ApiErrorResponse() },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options) as SwaggerSpec;
