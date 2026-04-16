"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = rateLimit;
exports.getRateLimitStatus = getRateLimitStatus;
const helpers_1 = require("../utils/helpers");
const defaultConfig = {
    windowMs: 60 * 60 * 1000,
    maxRequests: 80,
};
const store = new Map();
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
        if (value.resetTime <= now) {
            store.delete(key);
        }
    }
}, 60 * 1000);
function rateLimit(config = {}) {
    const { windowMs, maxRequests } = { ...defaultConfig, ...config };
    return (req, res, next) => {
        const ip = (0, helpers_1.getClientIp)(req);
        const now = Date.now();
        const key = `rate_limit:${ip}`;
        let record = store.get(key);
        if (!record || record.resetTime <= now) {
            record = {
                count: 0,
                resetTime: now + windowMs,
            };
            store.set(key, record);
        }
        record.count++;
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
        res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));
        if (record.count > maxRequests) {
            const retryAfter = Math.ceil((record.resetTime - now) / 1000);
            res.setHeader('Retry-After', retryAfter);
            res.status(429).json({
                code: 429,
                message: 'Too many requests, please try again later.',
                data: { ip },
            });
            return;
        }
        next();
    };
}
function getRateLimitStatus(ip) {
    const key = `rate_limit:${ip}`;
    const record = store.get(key);
    if (record && record.resetTime > Date.now()) {
        return { count: record.count, resetTime: record.resetTime };
    }
    return null;
}
