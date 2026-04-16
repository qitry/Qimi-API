import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import { registerRoutes } from './routes';
import { rateLimit } from '../lib/core/rateLimit';
import { logger } from '../lib/core/logger';
import { getErrorResponse } from '../lib/core/error';
import { error, success } from '../lib/utils/response';
import { swaggerSpec } from './lib/swagger';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(rateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 80 }));

app.use('/rapidoc', express.static(path.join(process.cwd(), 'node_modules/rapidoc/dist')));

app.get('/api-docs', (_req: Request, res: Response) => {
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

app.get('/api/docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get('/api', (_req: Request, res: Response) => {
  const endpoints: string[] = [];

  if (swaggerSpec.paths) {
    for (const [path, methods] of Object.entries(swaggerSpec.paths)) {
      for (const [method, info] of Object.entries(methods)) {
        if (method !== 'parameters') {
          endpoints.push(
            `${method.toUpperCase()} ${path} - ${info.summary || info.description || path}`,
          );
        }
      }
    }
  }

  res.json(
    success({
      name: 'QimiAPI',
      version: '1.0.0',
      description: '免费 API 服务集合',
      docs: '/api-docs',
      endpoints,
    }),
  );
});

registerRoutes(app);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', err);
  const { code, message } = getErrorResponse(err);
  res.status(200).json(error(code, message, null));
});

app.use((_req: Request, res: Response) => {
  res.status(404).json(error(404, 'Route not found', null));
});

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

export default app;
