"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = require("./routes");
const rateLimit_1 = require("../lib/core/rateLimit");
const logger_1 = require("../lib/core/logger");
const error_1 = require("../lib/core/error");
const response_1 = require("../lib/utils/response");
const swagger_1 = require("./lib/swagger");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, rateLimit_1.rateLimit)({ windowMs: 60 * 60 * 1000, maxRequests: 80 }));
app.use('/rapidoc', express_1.default.static(path_1.default.join(__dirname, '../node_modules/rapidoc/dist')));
app.get('/api-docs', (_req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
  <title>QimiAPI 文档</title>
  <script type="module" src="/rapidoc/rapidoc.js"></script>
</head>
<body>
  <rapi-doc 
    spec-url="/api/docs.json"
    theme="dark"
    header-background="#1a1a2e"
    nav-background="#16213e"
    nav-accent-color="#e94560"
    font-size="medium"
    show-header="true"
    show-info="true"
    show-nav="true"
    show-components="true"
    show-tags="true"
    allow-server-selection="false"
    allow-authentication="false"
    allow-try="true"
    render-style="read"
    fill-request-fields-with-example="true"
  > 
    <div slot="nav-logo" style="display:flex;align-items:center;padding:10px;">
      <span style="font-size:1.5em;margin-right:10px;">📖</span>
      <span style="font-size:1.2em;font-weight:bold;">QimiAPI</span>
    </div>
  </rapi-doc>
</body>
</html>`);
});
app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swagger_1.swaggerSpec);
});
app.get('/api', (_req, res) => {
    res.json((0, response_1.success)({
        name: 'QimiAPI',
        version: '1.0.0',
        description: '免费 API 服务集合',
        docs: '/api-docs',
        endpoints: [
            '/api/weather - 天气查询',
            '/api/ip - IP 归属地查询',
            '/api/search - Bing 搜索',
            '/api/baidu - 百度热搜',
            '/api/bilibili - B站热榜',
            '/api/history - 历史上的今天',
            '/api/suggest - 百度搜索建议',
            '/api/baidu-search - 百度搜索',
            '/api/lunar - 农历黄历',
            '/api/60s - 60秒读懂世界',
            '/api/hot - 综合热搜榜',
        ],
    }));
});
(0, routes_1.registerRoutes)(app);
app.use((err, _req, res, _next) => {
    logger_1.logger.error('Unhandled error', err);
    const { code, message } = (0, error_1.getErrorResponse)(err);
    res.status(200).json((0, response_1.error)(code, message, null));
});
app.use((_req, res) => {
    res.status(404).json((0, response_1.error)(404, 'Route not found', null));
});
app.listen(PORT, () => {
    logger_1.logger.info(`Server is running on port ${PORT}`);
});
exports.default = app;
