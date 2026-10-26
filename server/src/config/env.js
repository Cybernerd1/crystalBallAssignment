/**
 * Central environment configuration. Reads, validates and normalizes every
 * setting the server needs at startup, and fails fast (before serving) when
 * something is missing or malformed — a misconfigured server should never
 * come half-alive.
 *
 * All other modules import from here; nothing reads process.env directly.
 */

const SUPPORTED_NODE_ENVS = ['development', 'production', 'test'];

function readString(key) {
  const value = process.env[key];
  return typeof value === 'string' ? value.trim() : '';
}

function fail(message) {
  throw new Error(`[env] ${message}`);
}

/** Comma-separated list → trimmed array of origin URLs. */
function readOrigins(key) {
  return readString(key)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function validate() {
  const portRaw = readString('PORT');
  const port = Number.parseInt(portRaw, 10);
  if (!portRaw || !Number.isInteger(port) || port < 1 || port > 65535) {
    fail(`PORT must be an integer between 1 and 65535 (got "${portRaw || 'unset'}")`);
  }

  const mongodbUri = readString('MONGODB_URI');
  if (!mongodbUri) {
    fail('MONGODB_URI is required. Copy .env.example to .env and set it (e.g. mongodb://127.0.0.1:27017/forma)');
  }
  if (!/^mongodb(\+srv)?:\/\//.test(mongodbUri)) {
    fail('MONGODB_URI must start with mongodb:// or mongodb+srv://');
  }

  // CORS is strict: without a known client the API would be unusable and we
  // prefer a clear startup message over silently reflecting any origin.
  const origins = readOrigins('CLIENT_ORIGIN');
  if (origins.length === 0) {
    fail('CLIENT_ORIGIN is required. Set it to your frontend URL, e.g. http://localhost:5173 (comma-separate several origins)');
  }
  for (const origin of origins) {
    if (!/^https?:\/\/[\w.:-]+$/.test(origin)) {
      fail(`CLIENT_ORIGIN contains an invalid origin: "${origin}"`);
    }
  }

  const nodeEnv = readString('NODE_ENV') || 'development';
  if (!SUPPORTED_NODE_ENVS.includes(nodeEnv)) {
    fail(`NODE_ENV must be one of ${SUPPORTED_NODE_ENVS.join(' | ')} (got "${nodeEnv}")`);
  }

  return { port, mongodbUri, clientOrigins: origins, nodeEnv };
}

const config = Object.freeze(validate());

export default config;
export const port = config.port;
export const mongodbUri = config.mongodbUri;
export const clientOrigins = config.clientOrigins;
export const nodeEnv = config.nodeEnv;
export const isProduction = config.nodeEnv === 'production';
