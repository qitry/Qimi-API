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
└── routes/
    ├── index.ts        # Route registration (all /api/*)
    ├── weather.ts      # GET /api/weather
    ├── ip.ts           # GET /api/ip
    ├── history.ts      # GET /api/history
    ├── lunar.ts        # GET /api/lunar
    ├── 60s.ts          # GET /api/60s
    ├── bing.ts         # GET /api/bing (wallpaper)
    ├── qrcode.ts       # GET /api/qrcode
    ├── exchange-rate.ts # GET /api/exchange-rate
    └── hot-*.ts        # GET /api/hot/{weibo,baidu,douyin,bilibili,zhihu,qqnews-hot,qqnews-curation,news163-toutiao}

lib/
├── core/               # rateLimit, logger, error, env
└── utils/              # response, helpers, hot, cache, http

history_today/          # Static JSON files for historical events (01-12.json)
```

## Architecture Notes

- **Unified Response Format**: All endpoints use `success()`/`error()` from `lib/utils/response.ts`
- **Rate Limiting**: 80 requests/hour per IP, configured in `src/app.ts`
- **Hot Endpoints**: Cached (30 min TTL) via `lib/utils/cache.ts`, fetched from `cdn.lylme.com/api/hot/`
- **Swagger**: Auto-generated from JSDoc comments in route handlers
- **TypeScript Paths**: `@/*` alias maps to `lib/*` (see tsconfig.json)

## API Docs

- Swagger UI: `/api-docs` (uses RapiDoc)
- OpenAPI JSON: `/api/docs.json`
- API endpoint list: `GET /api`

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
