export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface RouteConfig {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';
  rateLimit?: {
    windowMs?: number;
    maxRequests?: number;
  };
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface EnvConfig {
  NODE_ENV?: string;
  LOG_LEVEL?: string;
  [key: string]: string | undefined;
}
