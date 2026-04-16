# Qimi API 更新日志

## v1.2.0 (2026-04-16)

### 重构升级

- **架构迁移** - 从 Vercel Serverless 迁移到 Express + PM2 部署
- **项目结构重组** - 采用 `src/app.ts` 入口 + `src/routes/` 路由模块
- **测试脚本优化** - `test_apis.sh` 支持格式化输出，默认显示关键信息

### 新增功能

- **多平台热搜独立 API** - 微博/抖音/B站/知乎/腾讯新闻/网易新闻各有独立端点
- **OpenAPI 文档** - 支持 RapiDoc 在线文档 (`/api-docs`)
- **API 文档端点** (`/api`) - 返回所有可用端点列表

### 其他改进

- 更新 AGENTS.md 文档，添加 PM2 部署指南
- 清理冗余文件，优化项目结构
- 完善 TypeScript 类型定义

---

## v1.1.0 (2026-04-15)

### 新增功能

- **60秒读懂世界 API** (`/api/60s`) - 每日简报新闻摘要
- **多平台热搜榜 API** (`/api/hot`) - 百度/微博/抖音/知乎热搜
- **完整黄历 API** (`/api/lunar`) - 农历/干支/宜忌/节气/吉神凶煞

### 优化改进

- **统一 API 响应格式** - 所有接口采用 `{ code, message, data }` 格式
- **完善 OpenAPI 文档** - 详细定义 data schema，方便开发者对接
- **新增 TypeScript 类型声明** - lunar-javascript 库类型支持
- **项目工程化升级** - ESLint + Prettier + Husky + lint-staged
- **路由管理器优化** - 集中管理 API 路由分发

---

## v1.0.1 (2026-04-15)

### 新增功能

- **搜索联想 API** (`/api/suggest`) - 获取百度搜索联想词列表
- **百度热搜 API** (`/api/baidu`) - 获取百度实时热搜榜单
- **百度搜索 API** (`/api/baidu-search`) - 获取百度搜索结果 (Alpha)

---

## v1.0.0 (2026-04-15)

### 新增功能

- **天气查询 API** (`/api/weather`) - 支持 IP 自动定位
- **IP 定位 API** (`/api/ip`) - 查询 IP/域名地理位置
- **网页搜索 API** (`/api/search`) - Bing 搜索结果
- **B站热榜 API** (`/api/bilibili`) - 获取热门视频榜单
- **历史上的今天 API** (`/api/history`) - 历史事件查询
