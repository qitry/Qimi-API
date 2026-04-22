"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientIp = getClientIp;
exports.normalizeIp = normalizeIp;
exports.isReservedIp = isReservedIp;
exports.parseQuery = parseQuery;
exports.parseInteger = parseInteger;
exports.sleep = sleep;
function normalizeIp(ip) {
    if (ip.startsWith('::ffff:'))
        return ip.slice(7);
    return ip;
}
function isReservedIp(ip) {
    if (!ip)
        return true;
    return (ip === '::1' ||
        ip === '127.0.0.1' ||
        ip === '0.0.0.0' ||
        ip === '::' ||
        ip.startsWith('127.') ||
        ip.startsWith('10.') ||
        ip.startsWith('192.168.') ||
        /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
        ip.startsWith('fc') ||
        ip.startsWith('fd') ||
        ip === 'unknown');
}
function extractFirstPublicIp(header) {
    const ips = header.split(',').map(s => normalizeIp(s.trim()));
    return ips.find(ip => !isReservedIp(ip)) || null;
}
function getClientIp(req) {
    const proxyHeaders = [
        'cf-connecting-ip',
        'true-client-ip',
        'x-real-ip',
        'x-forwarded-for',
    ];
    for (const header of proxyHeaders) {
        const value = req.headers[header];
        if (value) {
            const ip = extractFirstPublicIp(value);
            if (ip)
                return ip;
        }
    }
    const ip = normalizeIp(req.ip || '');
    if (!isReservedIp(ip))
        return ip;
    return 'unknown';
}
function parseQuery(value) {
    if (typeof value === 'string') {
        return value;
    }
    if (Array.isArray(value) && value.length > 0) {
        return String(value[0]);
    }
    return undefined;
}
function parseInteger(value, defaultValue = 0) {
    if (value === undefined || value === '') {
        return defaultValue;
    }
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : defaultValue;
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
