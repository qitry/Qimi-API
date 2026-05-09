# AGENTS.md

## Commands

| Command          | Description                                    |
| ---------------- | ---------------------------------------------- |
| `yarn dev`       | Start dev server with hot reload (tsx watch)   |
| `yarn build`     | Compile TypeScript to `dist/src/`              |
| `yarn start`     | Run production server (`node dist/src/app.js`) |
| `yarn typecheck` | Type-check with `tsc --noEmit`                 |
| `yarn lint`      | ESLint check                                   |
| `yarn lint:fix`  | ESLint auto-fix                                |
| `yarn format`    | Prettier format                                |
| `yarn test`      | Run `test_apis.sh` (requires server running)   |

## Project Structure

```
src/
├── app.ts              # Express entry point (port 3000)
├── lib/swagger.ts      # OpenAPI spec definition (JSDoc-based)
└── api/
    ├── index.ts        # Route registration (all /api/*)
    ├── someapi/        # General utility APIs (weather, ip, bing, qrcode, etc.)
    ├── minecraft/      # Minecraft APIs (player, names, skin)
    └── hot/            # Hot list endpoints (weibo, baidu, douyin, etc.)

lib/
├── core/               # rateLimit, logger, error, env
└── utils/              # response, helpers, hot, cache, http

public/
└── test.html           # API test panel (/test)

history_today/          # Static JSON files for historical events (01-12.json)
```

## Architecture Notes

- **Unified Response Format**: All endpoints use `success()`/`error()` from `lib/utils/response.ts`
- **Rate Limiting**: 80 requests/hour per IP, configured in `src/app.ts`
- **Hot Endpoints**: Cached (30 min TTL) via `lib/utils/cache.ts`, fetched from `cdn.lylme.com/api/hot/`
- **Minecraft Endpoints**: Cached (60 min TTL) via `lib/utils/cache.ts`, use Mojang official API
- **Avatar Endpoints**: Cached (24h TTL), supports external (DiceBear/Robohash) and algorithmic generation
- **Swagger**: Generated from route definitions in `src/lib/swagger.ts`
- **TypeScript Paths**: `@/*` alias maps to `lib/*` (see tsconfig.json)

## API Docs

- Swagger UI: `/api-docs` (uses RapiDoc)
- OpenAPI JSON: `/api/docs.json`
- API endpoint list: `GET /api`
- API 测试面板: `/test` (交互式调用所有接口)

## Development Workflow

- Pre-commit hooks run `lint-staged` automatically
- ESLint + Prettier configured with specific rules
- Test script requires server to be running (`yarn dev & && yarn test`)
- Tests use curl + jq; run `yarn test --raw` for raw JSON output

## Testing

```bash
yarn dev &          # start server
yarn test           # run smoke tests
yarn test --raw     # raw JSON output
```

## Environment Variables

`PORT` (default 3000), `NODE_ENV`, `LOG_LEVEL` (debug/info/warn/error)

## PM2 Deployment

```bash
yarn build && pm2 start dist/src/app.js --name qimiapi && pm2 save
```
