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
app.use('/rapidoc', express_1.default.static(path_1.default.join(process.cwd(), 'node_modules/rapidoc/dist')));
app.get('/api-docs', (_req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
  <title>QimiAPI</title>
  <script type="module" src="/rapidoc/rapidoc-min.js"></script>
</head>
<body>
  <rapi-doc spec-url="/api/docs.json" theme="dark" render-style="read" allow-try="true"></rapi-doc>
</body>
</html>`);
});
app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swagger_1.swaggerSpec);
});
app.get('/api', (_req, res) => {
    const endpoints = [];
    if (swagger_1.swaggerSpec.paths) {
        for (const [path, methods] of Object.entries(swagger_1.swaggerSpec.paths)) {
            for (const [method, info] of Object.entries(methods)) {
                if (method !== 'parameters') {
                    endpoints.push(`${method.toUpperCase()} ${path} - ${info.summary || info.description || path}`);
                }
            }
        }
    }
    res.json((0, response_1.success)({
        name: 'QimiAPI',
        version: '1.0.0',
        description: '免费 API 服务集合',
        docs: '/api-docs',
        endpoints,
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
