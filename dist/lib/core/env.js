"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = getEnv;
exports.requireEnv = requireEnv;
exports.isProduction = isProduction;
exports.isDevelopment = isDevelopment;
exports.clearEnvCache = clearEnvCache;
const envCache = new Map();
function getEnv(key) {
    if (envCache.has(key)) {
        return envCache.get(key);
    }
    const value = process.env[key];
    if (value !== undefined) {
        envCache.set(key, value);
    }
    return value;
}
function requireEnv(key) {
    const value = getEnv(key);
    if (value === undefined) {
        throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
}
function isProduction() {
    return process.env.NODE_ENV === 'production';
}
function isDevelopment() {
    return process.env.NODE_ENV === 'development';
}
function clearEnvCache() {
    envCache.clear();
}
