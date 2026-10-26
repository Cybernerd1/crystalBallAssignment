import 'dotenv/config';

import app from './app.js';
import { connectToDatabase, disconnectDatabase } from './config/db.js';
import { port } from './config/env.js';

// Config/env.js has already validated PORT, MONGODB_URI and CLIENT_ORIGIN and
// thrown before we get here if anything is wrong — fail fast by design.

process.on('uncaughtException', (err) => {
  console.error('[process] Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[process] Unhandled rejection:', reason);
  process.exit(1);
});

// Graceful failure path: a failed initial DB connection aborts startup with a
// clear message instead of leaving the API half-alive.
try {
  await connectToDatabase();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}

const server = app.listen(port, () => {
  console.log(`[server] Forma API listening on http://localhost:${port}`);
});

async function shutdown(signal) {
  console.log(`[process] ${signal} received — shutting down`);
  server.close();
  await disconnectDatabase();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
