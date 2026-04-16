# AGENTS.md

## Commands

- `yarn dev` - start development server with hot reload
- `yarn start` - start production server
- `yarn build` - compile TypeScript to JavaScript
- `yarn test` - smoke-test all endpoints (requires server running)
- `yarn typecheck` - type-check using TypeScript compiler
- `yarn lint` - lint all files using ESLint
- `yarn lint:fix` - auto-fix linting issues
- `yarn format` - format code with Prettier

## Project Structure

```
qimiapi/
├── src/
│   ├── app.ts          # Express server entry point
│   └── routes/         # API route handlers (one file per endpoint)
│       ├── index.ts    # Route registration
│       ├── weather.ts  # 天气查询
│       ├── ip.ts       # IP 归属地查询
│       ├── search.ts   # Bing 搜索
│       ├── baidu.ts    # 百度热搜
│       ├── bilibili.ts # B站热榜
│       ├── history.ts  # 历史上的今天
│       ├── suggest.ts  # 百度搜索建议
│       ├── baidu-search.ts # 百度搜索
│       ├── lunar.ts    # 农历黄历
│       ├── 60s.ts      # 60秒读懂世界
│       └── hot.ts      # 综合热搜榜
├── lib/                # Core utilities (rate limit, logger, etc.)
├── dist/               # Compiled JavaScript output
├── types/              # TypeScript declaration files
└── test_apis.sh       # API smoke test script
```

## TypeScript

- Strict mode enabled
- 2-space indentation, single quotes, semicolons
- Custom type declarations in `types/` directory

## Testing

- Run `yarn dev` first, then `yarn test` in parallel
- Test script: `bash test_apis.sh http://localhost:3000 --raw`
- Add new endpoint tests to `test_apis.sh`

## Upstream Dependencies

- `/api/weather` → `api.open-meteo.com` + `ip-api.com` (IP 定位备用)
- `/api/ip` → `ip-api.com`
- `/api/search` → `cn.bing.com` (Bing RSS)
- `/api/baidu-search` → `baidu.com` (百度搜索)
- `/api/baidu` → `top.baidu.com` (百度热搜)
- `/api/bilibili` → `api.bilibili.com` (B站热榜)
- `/api/lunar` → `festival2.wifilu.com` + `api.suyanw.cn` + `lunar-javascript` (今日农历/节气/节日/星座运势/宜忌)
- `/api/history` → `cdn.lylme.com` (历史上的今天)
- `/api/60s` → `cdn.lylme.com` (60秒读懂世界)
- `/api/hot` → `cdn.lylme.com` (多平台热搜榜)

## Environment Variables

- `PORT` - 服务器端口 (默认: 3000)
- `NODE_ENV` - 运行环境 (`development`/`production`)
- `LOG_LEVEL` - 日志级别 (`debug`/`info`/`warn`/`error`)

## PM2 Deployment

```bash
# Build first
yarn build

# Start with PM2
pm2 start dist/app.js --name qimiapi

# Save PM2 process list
pm2 save

# Setup startup script
pm2 startup
```
