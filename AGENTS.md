# AGENTS.md

## Commands

- `yarn test` - smoke-test all endpoints (requires `vercel dev` running in another terminal)
- `yarn generate-types` - regenerate `api/types.ts` from OpenAPI spec
- `vercel dev` - start local Vercel runtime for testing
- `yarn typecheck` - type-check using TypeScript compiler
- `yarn lint` - lint all files using ESLint
- `yarn lint:fix` - auto-fix linting issues

## Project Structure

- `api/*.ts` - Vercel serverless handlers (weather, ip, search, history, 60s, hot, lunar, openapi)
- `api/openapi-spec.json` - source OpenAPI document
- `api/types.ts` - **generated** from spec; do not edit manually
- `lib/` - Core utilities (rate limit, logger, error handling, etc.)
- `types/` - TypeScript declaration files
- `vercel.json` - routes `/api/*` to handlers, everything else to `index.html`
- `search.html` - static search demo page
- `.vercel/` - do not commit

## TypeScript

- Strict mode enabled
- 2-space indentation, single quotes, semicolons
- Use types from `api/types.ts` for request/response shapes
- Custom type declarations in `types/` directory

## Testing

- Run `vercel dev` first, then `yarn test` in parallel
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

- `NODE_ENV` - 运行环境 (`development`/`production`)
- `LOG_LEVEL` - 日志级别 (`debug`/`info`/`warn`/`error`)

## Important

- Always run `yarn generate-types` after modifying `api/openapi-spec.json`
- Include regenerated `api/types.ts` in the same PR as spec changes
- `search.ts` handler does not use the `ip` query param (spec 定义了但未实现); 勿依赖此参数
- `/api/weather` 的 `ip` 参数实际可用 (handler 实现正确，但 spec 未注明 IP 自动定位逻辑)
