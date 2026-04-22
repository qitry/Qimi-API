# QimiAPI 接口文档

基础地址: `https://api.qitry.vip`

所有接口均为 `GET` 请求，返回 JSON 格式数据。

## 通用响应结构

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 状态码，200 表示成功 |
| message | string | 状态描述 |
| data | any | 业务数据 |

### 错误响应

```json
{
  "code": 400,
  "message": "错误描述",
  "data": null
}
```

### 频率限制

- 默认 80 次/小时/IP
- 响应头中包含限制信息：
  - `X-RateLimit-Limit`: 总请求次数
  - `X-RateLimit-Remaining`: 剩余次数
  - `X-RateLimit-Reset`: 重置时间 (Unix 时间戳)

### IP 识别

服务自动通过以下请求头获取客户端真实 IP（按优先级排列）：

1. `CF-Connecting-IP` (Cloudflare)
2. `True-Client-IP` (Akamai / Cloudflare Enterprise)
3. `X-Real-IP` (Nginx)
4. `X-Forwarded-For` (通用代理)

---

## Bing 每日壁纸 & 故事

```
GET /api/bing
```

获取 Bing 首页每日高清壁纸及背后的故事。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| n | number | 否 | 返回数量，默认 1，最大 8 |
| idx | number | 否 | 偏移天数，0=今天，默认 0 |

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "date": "20260422",
    "images": [
      {
        "title": "行动的力量",
        "copyright": "阿拉姆-佩德亚自然保护区，塔尔图县，爱沙尼亚 (© Sven Zacek/Nature Picture Library)",
        "desc": "阿拉姆-佩德亚自然保护区，塔尔图县，爱沙尼亚...",
        "url": "https://cn.bing.com/th?id=OHR.TartuEstonia_ZH-CN5477370206_1920x1080.jpg",
        "url_base": "https://cn.bing.com/th?id=OHR.TartuEstonia_ZH-CN5477370206",
        "enddate": "20260422"
      }
    ]
  }
}
```

### data 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| title | string | 图片标题 |
| copyright | string | 版权信息 |
| desc | string | 故事描述 |
| url | string | 图片完整 URL (1920x1080) |
| url_base | string | 图片基础 URL，可拼接其他分辨率 |
| enddate | string | 日期 (YYYYMMDD) |

### 示例

```
GET /api/bing
GET /api/bing?n=8&idx=0
```

---

## 二维码生成

```
GET /api/qrcode
```

将文本或 URL 生成二维码图片，可直接用于 img 标签。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| text | string | 是 | 需要编码的文本或 URL |
| size | number | 否 | 图片尺寸，默认 300，最小 50，最大 1000 |
| format | string | 否 | 输出格式，`png` 或 `svg`，默认 `png` |
| margin | number | 否 | 边距，默认 4，最小 0，最大 50 |

### 响应

返回图片二进制数据（Content-Type: `image/png` 或 `image/svg+xml`）

### 示例

```
GET /api/qrcode?text=https://example.com
GET /api/qrcode?text=hello&size=400&format=png
```

---

## 汇率转换

```
GET /api/exchange-rate
```

查询实时汇率并进行货币转换。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| from | string | 否 | 源货币代码，默认 `USD` |
| to | string | 否 | 目标货币代码，默认 `CNY` |
| amount | number | 否 | 转换金额，默认 1 |

支持常用货币：USD, CNY, EUR, GBP, JPY, KRW, HKD, TWD, SGD, AUD, CAD, CHF 等

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "from": "USD",
    "to": "CNY",
    "amount": 100,
    "rate": 6.836376,
    "result": 683.64,
    "last_updated": "Wed, 22 Apr 2026 00:02:31 +0000"
  }
}
```

### data 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| from | string | 源货币代码 |
| to | string | 目标货币代码 |
| amount | number | 原始金额 |
| rate | number | 汇率 |
| result | number | 转换结果 |
| last_updated | string | 汇率更新时间 |

### 示例

```
GET /api/exchange-rate
GET /api/exchange-rate?from=EUR&to=CNY&amount=100
GET /api/exchange-rate?from=USD&to=JPY
```

---

## 天气查询

```
GET /api/weather
```

根据经纬度或 IP 地址查询当前天气。若未提供经纬度和 IP，则自动根据客户端 IP 定位；若 IP 定位失败，则回退到北京坐标。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| latitude | string | 否 | 纬度，优先级最高 |
| longitude | string | 否 | 经度，优先级最高 |
| ip | string | 否 | 用于定位的公网 IP |

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "latitude": 39.875,
    "longitude": 116.375,
    "timezone": "GMT",
    "elevation": 49,
    "current_weather_units": {
      "time": "iso8601",
      "interval": "seconds",
      "temperature": "\u00b0C",
      "windspeed": "km/h",
      "winddirection": "\u00b0",
      "is_day": "",
      "weathercode": "wmo code"
    },
    "current_weather": {
      "time": "2026-04-21T18:00",
      "interval": 900,
      "temperature": 12.8,
      "windspeed": 3.4,
      "winddirection": 162,
      "is_day": 0,
      "weathercode": 2
    },
    "location": {
      "lat": "39.9",
      "lon": "116.4"
    }
  }
}
```

### 响应头

| 响应头 | 说明 |
|--------|------|
| X-Location-City | 定位到的城市名称 |
| X-Location-Fallback | 若为 `true`，表示使用了默认坐标（北京） |

---

## IP 归属地查询

```
GET /api/ip
```

查询 IP 地址的地理位置、运营商等信息。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| query | string | 否 | 要查询的 IP 地址，留空则使用客户端 IP |
| lang | string | 否 | 返回语言，默认 `zh-CN` |
| fields | string | 否 | 返回字段列表（逗号分隔） |

支持的语言：`zh-CN`、`en`、`ja`、`de`、`fr`、`pt`、`es`、`ru` 等。

默认返回字段：`status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "status": "success",
    "country": "美国",
    "countryCode": "US",
    "region": "VA",
    "regionName": "弗吉尼亚州",
    "city": "Ashburn",
    "zip": "20149",
    "lat": 39.03,
    "lon": -77.5,
    "timezone": "America/New_York",
    "isp": "Google LLC",
    "org": "Google Public DNS",
    "as": "AS15169 Google LLC.",
    "query": "8.8.8.8"
  }
}
```

### 示例

```
GET /api/ip?query=8.8.8.8&lang=en
GET /api/ip?query=1.1.1.1&fields=status,country,city,query
```

---

## Bing 搜索

```
GET /api/search
```

通过 Bing 获取搜索结果。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | 是 | 搜索关键词 |
| count | number | 否 | 返回结果数量，默认 10，最大 50 |
| lang | string | 否 | 语言代码，默认 `zh` |

支持的语言：`zh`、`en`、`ja`、`ko`、`fr`、`de`、`es`、`pt`、`ru`、`ar`

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "results": [
      {
        "title": "Example Title",
        "link": "https://example.com/page",
        "description": "页面摘要描述...",
        "pubDate": "周二, 21 4月 2026 03:43:00 GMT"
      }
    ],
    "count": 10
  }
}
```

---

## 百度搜索建议

```
GET /api/suggest
```

获取百度搜索联想词。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | 是 | 搜索关键词 |

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "query": "test",
    "suggestions": [
      "test",
      "test的中文翻译",
      "testflight",
      "test怎么读",
      "testing"
    ]
  }
}
```

---

## 百度搜索

```
GET /api/baidu-search
```

> 此接口不稳定，可能触发百度安全验证，建议优先使用 Bing 搜索。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | 是 | 搜索关键词 |
| count | number | 否 | 返回结果数量，默认 10，最大 20 |

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "query": "关键词",
    "results": [
      {
        "title": "标题",
        "link": "https://...",
        "description": "摘要...",
        "date": ""
      }
    ],
    "count": 5,
    "source": "baidu",
    "status": "alpha"
  }
}
```

---

## 历史上的今天

```
GET /api/history
```

查询历史上某月某日发生的重大事件。默认返回当天。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| month | string | 否 | 月份 (1-12)，默认当月 |
| day | string | 否 | 日期 (1-31)，默认当日 |

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "year": "1969",
      "title": "阿波罗11号成功登月",
      "desc": "1969年7月20日...",
      "link": "https://baike.baidu.com/item/...",
      "date": "0720",
      "type": "event",
      "festival": ""
    }
  ]
}
```

### data 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| year | string | 事件发生的年份 |
| title | string | 事件标题（可能包含 HTML 标签） |
| desc | string | 事件详细描述（可能包含 HTML 标签） |
| link | string | 百度百科（或无）链接 |
| date | string | 日期，格式 MMDD |
| type | string | 事件类型：`event`（事件）、`birth`（出生）、`death`（逝世） |
| festival | string | 当日节日名称，无则为空字符串 |

### 示例

```
GET /api/history
GET /api/history?month=7&day=20
```

---

## 农历黄历

```
GET /api/lunar
```

查询农历信息、干支、宜忌、节气、节日等。默认返回当天。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| date | string | 否 | 日期，格式 `YYYY-MM-DD`，默认当天 |

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "date": "2026-04-22",
    "solar": {
      "year": 2026,
      "month": 4,
      "day": 22,
      "weekday": "三"
    },
    "lunar": {
      "year": 2026,
      "month": 3,
      "day": 6,
      "monthName": "三",
      "dayName": "初六",
      "yearShengXiao": "马"
    },
    "ganzhi": {
      "year": "丙午",
      "month": "壬辰",
      "day": "丙寅",
      "hour": "戊子"
    },
    "yi": ["安香", "出行", "栽种", "嫁娶"],
    "ji": ["作灶", "安葬", "祭祀"],
    "chong": {
      "description": "冲猴(庚申)煞北",
      "sha": "北"
    },
    "pengZu": {
      "gan": "丙不修灶必见灾殃",
      "zhi": "寅不祭祀神鬼不尝"
    },
    "festivals": {
      "lunar": "",
      "solar": "",
      "solarTerm": ""
    },
    "fortune": null
  }
}
```

### 示例

```
GET /api/lunar
GET /api/lunar?date=2026-01-29
```

---

## 60秒读懂世界

```
GET /api/60s
```

获取每日新闻摘要（每日更新）。

### 参数

无

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": [
    "1、2025年我国人均阅读纸质书4.81本，较2024年增加0.02本；",
    "2、湖南试点学生运动能力达标：对应年级学生须达相应运动等级；",
    "3、一季度全社会用电量同比增长5.2%..."
  ]
}
```

---

## 热搜榜单

所有热搜接口共享统一的数据结构，仅路径不同。

### 数据结构

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "title": "热搜标题",
      "hotScore": "12345",
      "hotTag": "热",
      "hotTagName": "热",
      "url": "https://..."
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 排名序号 |
| title | string | 热搜标题 |
| hotScore | string/null | 热度分数，部分平台无此数据 |
| hotTag | string | 标签标识 |
| hotTagName | string | 标签显示名（如"热"、"新"、"沸"） |
| url | string | 原文链接 |

### 可用接口

| 接口路径 | 说明 |
|----------|------|
| `GET /api/hot/weibo` | 微博热搜 |
| `GET /api/hot/baidu` | 百度热搜 |
| `GET /api/hot/douyin` | 抖音热搜 |
| `GET /api/hot/bilibili` | B站热搜 |
| `GET /api/hot/zhihu` | 知乎热搜 |
| `GET /api/hot/qqnews-hot` | 腾讯新闻热榜 |
| `GET /api/hot/qqnews-curation` | 腾讯新闻精选 |
| `GET /api/hot/news163-toutiao` | 网易新闻头条 |

### 示例

```
GET /api/hot/weibo
GET /api/hot/bilibili
GET /api/hot/zhihu
```

---

## 接口总览

| 接口 | 说明 | 必填参数 |
|------|------|----------|
| `GET /api/bing` | Bing 每日壁纸 & 故事 | 无 |
| `GET /api/qrcode` | 二维码生成 | `text` |
| `GET /api/exchange-rate` | 汇率转换 | 无 |
| `GET /api/weather` | 天气查询 | 无（自动定位） |
| `GET /api/ip` | IP 归属地查询 | 无（使用客户端 IP） |
| `GET /api/search` | Bing 搜索 | `q` |
| `GET /api/suggest` | 百度搜索建议 | `q` |
| `GET /api/baidu-search` | 百度搜索（不稳定） | `q` |
| `GET /api/history` | 历史上的今天 | 无（当天） |
| `GET /api/lunar` | 农历黄历 | 无（当天） |
| `GET /api/60s` | 60秒读懂世界 | 无 |
| `GET /api/hot/{platform}` | 热搜榜单 | 无 |
