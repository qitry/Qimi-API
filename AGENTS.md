# AGENTS.md

## Commands
- `yarn test` - smoke-test all endpoints (requires `vercel dev` running in another terminal)
- `yarn generate-types` - regenerate `api/types.ts` from OpenAPI spec
- `vercel dev` - start local Vercel runtime for testing
- `tsc --noEmit` - type-check (no script defined; run directly)

## Project Structure
- `api/*.ts` - Vercel serverless handlers (weather, ip, search, history, openapi)
- `api/openapi-spec.json` - source OpenAPI document
- `api/types.ts` - **generated** from spec; do not edit manually
- `vercel.json` - routes `/api/*` to handlers, everything else to `index.html`
- `search.html` - static search demo page
- `.vercel/` - do not commit

## TypeScript
- Strict mode enabled
- 2-space indentation, single quotes, semicolons
- Use types from `api/types.ts` for request/response shapes

## Testing
- Run `vercel dev` first, then `yarn test` in parallel
- Test script: `bash test_apis.sh http://localhost:3000 --raw`
- Add new endpoint tests to `test_apis.sh`

## Upstream Dependencies
- `/api/weather` → `api.open-meteo.com` + `ip-api.com` (IP 定位备用)
- `/api/ip` → `ip-api.com`
- `/api/search` → `api.search.brave.com` (需要 `BRAVE_SEARCH_API_KEY`)
- `/api/history` → GitHub raw JSON 数据源

## Environment Variables
- `BRAVE_SEARCH_API_KEY` - required for `/api/search`; returns 503 if missing

## Important
- Always run `yarn generate-types` after modifying `api/openapi-spec.json`
- Include regenerated `api/types.ts` in the same PR as spec changes
- `search.ts` handler does not use the `ip` query param (spec 定义了但未实现); 勿依赖此参数
- `/api/weather` 的 `ip` 参数实际可用 (handler 实现正确，但 spec 未注明 IP 自动定位逻辑)
