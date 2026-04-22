interface CacheEntry<T> {
  data: T;
  expireAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private timer: ReturnType<typeof setInterval>;

  constructor(cleanupIntervalMs = 60 * 1000) {
    this.timer = setInterval(() => this.cleanup(), cleanupIntervalMs);
    this.timer.unref();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (entry.expireAt <= now) {
        this.store.delete(key);
      }
    }
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expireAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, expireAt: Date.now() + ttlMs });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  getOrSet<T>(key: string, factory: () => Promise<T>, ttlMs: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) return Promise.resolve(cached);

    const pending = this.get<Promise<T>>(`__pending:${key}`);
    if (pending) return pending;

    const promise = factory()
      .then(data => {
        this.set(key, data, ttlMs);
        this.delete(`__pending:${key}`);
        return data;
      })
      .catch(err => {
        this.delete(`__pending:${key}`);
        throw err;
      });

    this.set(`__pending:${key}`, promise, ttlMs);
    return promise;
  }
}

export const cache = new MemoryCache();
