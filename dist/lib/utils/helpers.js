"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientIp = getClientIp;
exports.parseQuery = parseQuery;
exports.parseInteger = parseInteger;
exports.sleep = sleep;
function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
        return ips.split(',')[0].trim();
    }
    return req.socket.remoteAddress || 'unknown';
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
