"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
exports.error = error;
exports.badRequest = badRequest;
exports.notFound = notFound;
exports.serverError = serverError;
exports.tooManyRequests = tooManyRequests;
exports.serviceUnavailable = serviceUnavailable;
function success(data, message = 'success') {
    return { code: 200, message, data };
}
function error(code, message, data = null) {
    return { code, message, data };
}
function badRequest(message = 'Bad request', data = null) {
    return error(400, message, data);
}
function notFound(message = 'Not found', data = null) {
    return error(404, message, data);
}
function serverError(message = 'Internal server error', data = null) {
    return error(500, message, data);
}
function tooManyRequests(message = 'Too many requests', data = null) {
    return error(429, message, data);
}
function serviceUnavailable(message = 'Service unavailable', data = null) {
    return error(503, message, data);
}
