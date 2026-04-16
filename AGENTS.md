# AGENTS.md

## Commands

| Command | Description |
|---------|-------------|
| `yarn dev` | Start dev server with hot reload (tsx watch) |
| `yarn build` | Compile TypeScript to `dist/src/` |
| `yarn start` | Run production server (`node dist/src/app.js`) |
| `yarn typecheck` | Type-check with `tsc --noEmit` |
| `yarn lint` | ESLint check |
| `yarn lint:fix` | ESLint auto-fix |
| `yarn format` | Prettier format |
| `yarn test` | Run `test_apis.sh` (requires server running) |

## Project Structure

```
src/
├── app.ts              # Express entry point (port 3000)
├── lib/swagger.ts      # OpenAPI spec definition
└── routes/
    ├── index.ts        # Route registration (all /api/*)
    ├── weather.ts      # GET /api/weather
    ├── ip.ts           # GET /api/ip
    ├── search.ts       # GET /api/search (Bing)
    ├── suggest.ts      # GET /api/suggest (百度建议)
    ├── baidu-search.ts # GET /api/baidu-search
    ├── history.ts      # GET /api/history
    ├── lunar.ts        # GET /api/lunar
    ├── 60s.ts          # GET /api/60s
    └── hot-*.ts        # GET /api/hot/{weibo,baidu,douyin,bilibili,zhihu,qqnews-hot,qqnews-curation,news163-toutiao}

lib/
├── core/               # rateLimit, logger, error, env
└── utils/              # response, helpers, hot
```

## API Docs

- Swagger UI: `/api-docs` (uses RapiDoc)
- OpenAPI JSON: `/api/docs.json`
- API endpoint list: `GET /api`

## Testing

```bash
yarn dev &          # start server
yarn test           # run smoke tests
```

## Rate Limiting

- 80 requests per hour per IP (configurable via env)

## Hot Endpoints (all from `cdn.lylme.com`)

`/api/hot/weibo`, `/api/hot/baidu`, `/api/hot/douyin`, `/api/hot/bilibili`, `/api/hot/zhihu`, `/api/hot/qqnews-hot`, `/api/hot/qqnews-curation`, `/api/hot/news163-toutiao`

## Environment Variables

`PORT` (default 3000), `NODE_ENV`, `LOG_LEVEL` (debug/info/warn/error)

## PM2 Deployment

```bash
yarn build && pm2 start dist/src/app.js --name qimiapi && pm2 save
```
