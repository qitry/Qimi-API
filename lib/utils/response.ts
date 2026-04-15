export function success<T>(
  data: T,
  message = 'success',
): { code: number; message: string; data: T } {
  return { code: 200, message, data };
}

export function error(
  code: number,
  message: string,
  data: unknown = null,
): { code: number; message: string; data: unknown } {
  return { code, message, data };
}

export function badRequest(message = 'Bad request', data: unknown = null) {
  return error(400, message, data);
}

export function notFound(message = 'Not found', data: unknown = null) {
  return error(404, message, data);
}

export function serverError(message = 'Internal server error', data: unknown = null) {
  return error(500, message, data);
}

export function tooManyRequests(message = 'Too many requests', data: unknown = null) {
  return error(429, message, data);
}

export function serviceUnavailable(message = 'Service unavailable', data: unknown = null) {
  return error(503, message, data);
}
