export class ApiError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export function isDuplicateKeyError(error, field) {
  if (error?.code !== 11000) return false;
  return field ? Boolean(error.keyPattern && field in error.keyPattern) : true;
}
