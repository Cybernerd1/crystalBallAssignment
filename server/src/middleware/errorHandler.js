/**
 * Central error middleware. Normalizes everything the app can throw into the
 * PRD error envelope `{ error: { code, message, fields } }`. Known families:
 * ApiError (carries its own code), invalid ids (CastError), mongoose
 * validation, duplicate email (E11000), malformed JSON, DB outages.
 * Stack traces never leave the server.
 */
import { ApiError, ERROR_CODES } from '../utils/ApiError.js';
import { isProduction } from '../config/env.js';

function log(level, message, err) {
  if (level === 'error') console.error('[error]', err);
  else console.warn(`[warn] ${message}`);
}

export default function errorHandler(err, req, res, next) {
  // Fast path: our own error type already carries the full contract.
  if (err instanceof ApiError) {
    if (err.status >= 500) log('error', '', err);
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.fields ? { fields: err.fields } : {}),
      },
    });
  }

  let status = 500;
  let code = ERROR_CODES.UNEXPECTED_ERROR;
  let message = 'Unexpected server error';
  let fields;

  switch (err?.name) {
    case 'CastError':
      // Bad :id reached Mongoose before our NoSQL-injection guard.
      status = 400;
      code = ERROR_CODES.INVALID_ID;
      message = 'Invalid identifier';
      break;
    case 'ValidationError': {
      status = 400;
      code = ERROR_CODES.VALIDATION_ERROR;
      message = 'Validation failed';
      fields = Object.fromEntries(
        Object.entries(err.errors ?? {}).map(([path, error]) => [path, error?.message ?? 'Invalid value']),
      );
      break;
    }
    case 'MongooseServerSelectionError':
      status = 503;
      code = ERROR_CODES.DB_UNAVAILABLE;
      message = 'Database is unavailable';
      break;
    default:
      break;
  }

  if (err?.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
    if (field === 'email') {
      code = ERROR_CODES.DUPLICATE_EMAIL;
      message = 'A user with this email already exists';
      fields = { email: message };
    } else {
      code = ERROR_CODES.VALIDATION_ERROR;
      message = `Duplicate value for ${field}`;
      fields = { [field]: message };
    }
  }

  if (err?.type === 'entity.parse.failed') {
    status = 400;
    code = ERROR_CODES.PARSE_ERROR;
    message = 'Request body is not valid JSON';
  }

  if (status >= 500) log('error', '', err);
  else if (!isProduction) log('warn', `${req.method} ${req.originalUrl} -> ${status}: ${message}`);

  return res.status(status).json({
    error: {
      code,
      message,
      ...(fields ? { fields } : {}),
    },
  });
}
