/**
 * Small HTTP-aware error type thrown by services/controllers and converted
 * to a consistent `{ error: { code, message, fields } }` response by the
 * error middleware. `code` is a stable machine identifier the client keys
 * its behavior on (e.g. focusing the email field on DUPLICATE_EMAIL).
 *
 * PRD error codes: VALIDATION_ERROR, DUPLICATE_EMAIL, INVALID_ID, NOT_FOUND,
 * PARSE_ERROR, DB_UNAVAILABLE, UNEXPECTED_ERROR.
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  INVALID_ID: 'INVALID_ID',
  NOT_FOUND: 'NOT_FOUND',
  PARSE_ERROR: 'PARSE_ERROR',
  DB_UNAVAILABLE: 'DB_UNAVAILABLE',
  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
};

export class ApiError extends Error {
  /**
   * @param {number} status HTTP status
   * @param {string} message human-readable message
   * @param {string} code machine error code
   * @param {Record<string,string>|undefined} fields per-field messages
   */
  constructor(status, message, code = ERROR_CODES.UNEXPECTED_ERROR, fields) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
    Error.captureStackTrace?.(this, ApiError);
  }

  static validation(message = 'Validation failed', fields) {
    return new ApiError(400, message, ERROR_CODES.VALIDATION_ERROR, fields);
  }

  static invalidId(message = 'Invalid identifier') {
    return new ApiError(400, message, ERROR_CODES.INVALID_ID);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message, ERROR_CODES.NOT_FOUND);
  }

  static duplicateEmail(message = 'A user with this email already exists') {
    return new ApiError(409, message, ERROR_CODES.DUPLICATE_EMAIL, { email: message });
  }

  static parse(message = 'Request body is not valid JSON') {
    return new ApiError(400, message, ERROR_CODES.PARSE_ERROR);
  }

  static dbUnavailable(message = 'Database is unavailable') {
    return new ApiError(503, message, ERROR_CODES.DB_UNAVAILABLE);
  }
}
