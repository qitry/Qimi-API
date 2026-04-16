"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceUnavailableError = exports.RateLimitError = exports.UnauthorizedError = exports.NotFoundError = exports.ValidationError = exports.AppError = void 0;
exports.isAppError = isAppError;
exports.getErrorResponse = getErrorResponse;
class AppError extends Error {
    code;
    isOperational;
    constructor(code, message, isOperational = true) {
        super(message);
        this.code = code;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message) {
        super(400, message);
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(404, message);
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(401, message);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class RateLimitError extends AppError {
    retryAfter;
    constructor(message = 'Too many requests', retryAfter) {
        super(429, message);
        this.retryAfter = retryAfter;
    }
}
exports.RateLimitError = RateLimitError;
class ServiceUnavailableError extends AppError {
    constructor(message = 'Service unavailable') {
        super(503, message);
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
function isAppError(error) {
    return error instanceof AppError;
}
function getErrorResponse(error) {
    if (isAppError(error)) {
        return { code: error.code, message: error.message };
    }
    if (error instanceof Error) {
        return { code: 500, message: error.message };
    }
    return { code: 500, message: 'Internal server error' };
}
