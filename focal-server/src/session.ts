import type { RequestHandler } from 'express';
import type { Pool } from 'pg';
import type { AppConfig } from './app.js';
import { ApiError } from './errors.js';
import { tokenHash } from './security.js';
import { COOKIE, cookieOptions } from './routes/auth.js';

declare global {
  namespace Express { interface Request { userId?: number; sessionTokenHash?: string } }
}
export function requireAuth(pool: Pool, config: AppConfig, now: () => Date): RequestHandler {
  return async (req, res, next) => {
    const token: unknown = req.cookies?.[COOKIE];
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) throw new ApiError(401, 'UNAUTHORIZED', 'Sign in to continue.');
    const hash = tokenHash(token);
    const time = now();
    const cutoff = new Date(time.getTime() - config.sessionIdleMinutes * 60000);
    const session = await pool.query(`UPDATE sessions SET last_seen_at = $2
      WHERE token_hash = $1 AND expires_at > $2 AND last_seen_at > $3 RETURNING user_id`, [hash, time, cutoff]);
    if (!session.rowCount) {
      await pool.query('DELETE FROM sessions WHERE token_hash = $1', [hash]);
      res.clearCookie(COOKIE, cookieOptions(config));
      throw new ApiError(401, 'UNAUTHORIZED', 'Sign in to continue.');
    }
    req.userId = session.rows[0].user_id;
    req.sessionTokenHash = hash;
    next();
  };
}
