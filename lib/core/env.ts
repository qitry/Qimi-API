const envCache = new Map<string, string>();

export function getEnv(key: string): string | undefined {
  if (envCache.has(key)) {
    return envCache.get(key);
  }

  const value = process.env[key];
  if (value !== undefined) {
    envCache.set(key, value);
  }
  return value;
}

export function requireEnv(key: string): string {
  const value = getEnv(key);
  if (value === undefined) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function clearEnvCache(): void {
  envCache.clear();
}
