"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
function formatTimestamp() {
    return new Date().toISOString();
}
function formatLog(entry) {
    const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
    if (entry.context && Object.keys(entry.context).length > 0) {
        return `${base} ${JSON.stringify(entry.context)}`;
    }
    return base;
}
function shouldLog(level) {
    const envLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
    return LOG_LEVELS[level] >= LOG_LEVELS[envLevel];
}
function log(level, message, context) {
    if (!shouldLog(level)) {
        return;
    }
    const entry = {
        timestamp: formatTimestamp(),
        level,
        message,
        context,
    };
    const formatted = formatLog(entry);
    switch (level) {
        case 'error':
            // eslint-disable-next-line no-console
            console.error(formatted);
            break;
        case 'warn':
            // eslint-disable-next-line no-console
            console.warn(formatted);
            break;
        default:
            // eslint-disable-next-line no-console
            console.log(formatted);
    }
}
exports.logger = {
    debug: (message, context) => log('debug', message, context),
    info: (message, context) => log('info', message, context),
    warn: (message, context) => log('warn', message, context),
    error: (message, error, context) => {
        const errorInfo = error instanceof Error ? { message: error.message, stack: error.stack } : undefined;
        log('error', message, { ...context, error: errorInfo });
    },
};
