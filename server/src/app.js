import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { isDatabaseConnected } from './config/db.js';
import { clientOrigins, isProduction } from './config/env.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import userRoutes from './routes/user.routes.js';

const app = express();

// CORS is strictly limited to the configured client origins. Missing or bad
// CLIENT_ORIGIN values abort startup in config/env.js — no reflect-any fallback.
app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin: clientOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }),
);

if (!isProduction) {
  app.use(morgan('dev'));
}

// Guard against oversized request bodies — this API only accepts small JSON.
app.use(express.json({ limit: '16kb' }));

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    data: {
      status: 'ok',
      database: isDatabaseConnected() ? 'connected' : 'disconnected',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
});

app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
