import { randomUUID } from 'node:crypto';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { ApiError } from './errors.js';
import { errorHandler } from './errors.js';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import type { Pool } from 'pg';

export interface AppConfig {
  nodeEnv: 'development' | 'production' | 'test'; host: string; port: number;
  clientOrigin: string; databaseUrl: string; sessionIdleMinutes: number;
  sessionMaxHours: number; trustProxyHops: number; authRateLimit: number;
}
export function createApp({ pool, config, now = () => new Date() }: { pool: Pool; config: AppConfig; now?: () => Date }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use((_req, res, next) => { res.setHeader('X-Request-Id', randomUUID()); next(); });
  app.get('/api/health', (_req, res) => { res.json({ status: 'ok' }); });
  app.get('/api/health/ready', async (_req, res) => {
    try { await pool.query('SELECT user_id FROM users LIMIT 0'); res.json({ status: 'ready' }); }
    catch { res.status(503).json({ status: 'unavailable' }); }
  });
  app.set('trust proxy', config.trustProxyHops === 0 ? false : config.trustProxyHops);
  app.use('/api', (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  app.use(cors({ origin: config.clientOrigin, credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] }));
  app.use('/api', (req, _res, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const origin = req.get('Origin');
      if ((origin && origin !== config.clientOrigin) || (!origin && req.get('Sec-Fetch-Site') === 'cross-site')) {
        throw new ApiError(403, 'FORBIDDEN_ORIGIN', 'This origin is not permitted.');
      }
    }
    next();
  });
  const limitMessage = { error: { code: 'RATE_LIMITED', message: 'Too many requests. Try again later.' } };
  app.use('/api', rateLimit({ windowMs: 60000, limit: 240, standardHeaders: 'draft-8', legacyHeaders: false, message: limitMessage }));
  app.use(['/api/auth/signup', '/api/auth/login'], rateLimit({ windowMs: 15 * 60000, limit: config.authRateLimit,
    standardHeaders: 'draft-8', legacyHeaders: false, message: limitMessage }));
  app.use(cookieParser());
  app.use(express.json({ limit: '32kb', inflate: false }));
  app.use('/api/auth', authRoutes(pool, config, now));
  app.use('/api/users', userRoutes(pool, config, now));
  app.get('/api/interests', async (_req, res) => {
    const result = await pool.query('SELECT interest_id, name FROM interests ORDER BY name');
    res.json({ interests: result.rows });
  });
  app.use((_req, _res, next) => next(new ApiError(404, 'NOT_FOUND', 'Endpoint not found.')));
  app.use(errorHandler);
  return app;
}
