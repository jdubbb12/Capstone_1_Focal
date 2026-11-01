import { Router } from 'express';
import type { Response } from 'express';
import type { Pool, PoolClient } from 'pg';
import { z } from 'zod';
import type { AppConfig } from '../app.js';
import { transaction } from '../db/transaction.js';
import { hashPassword, newSessionToken, tokenHash, verifyPassword } from '../security.js';
import { getSelf } from '../users.js';
import { ApiError } from '../errors.js';
import { requireAuth } from '../session.js';
import { randomBytes } from 'node:crypto';

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email().max(254));
export const passwordSchema = z.string().min(12).max(128);
export const usernameSchema = z.string().trim().toLowerCase().min(3).max(50).regex(/^[a-z0-9_]+$/);
export const roleSchema = z.enum(['2d_artist', '3d_designer', 'architect', 'other']);
export const nameSchema = z.string().trim().min(1).max(80);
const loginSchema = z.strictObject({ email: emailSchema, password: z.string().min(1).max(128) });
let dummyHash: Promise<string> | undefined;
const signupSchema = z.strictObject({
  email: emailSchema, password: passwordSchema, username: usernameSchema,
  first_name: nameSchema, last_name: nameSchema, creative_role: roleSchema.default('other'),
});
export const COOKIE = 'focal_session';
export function cookieOptions(config: AppConfig) {
  return { httpOnly: true, secure: config.nodeEnv === 'production', sameSite: 'lax' as const, path: '/api' };
}
export async function insertSession(db: PoolClient, userId: number, config: AppConfig, now: Date) {
  const token = newSessionToken();
  const expiresAt = new Date(now.getTime() + config.sessionMaxHours * 3600000);
  await db.query('INSERT INTO sessions (token_hash, user_id, created_at, last_seen_at, expires_at) VALUES ($1,$2,$3,$3,$4)',
    [tokenHash(token), userId, now, expiresAt]);
  return { token, expiresAt };
}
function sendSession(res: Response, session: { token: string; expiresAt: Date }, config: AppConfig) {
  res.cookie(COOKIE, session.token, { ...cookieOptions(config), expires: session.expiresAt });
}
export function authRoutes(pool: Pool, config: AppConfig, now: () => Date) {
  const router = Router();
  router.post('/signup', async (req, res) => {
    const data = signupSchema.parse(req.body);
    const passwordHash = await hashPassword(data.password);
    const result = await transaction(pool, async db => {
      const inserted = await db.query(`INSERT INTO users (email, username, password_hash, first_name, last_name, creative_role)
        VALUES ($1,$2,$3,$4,$5,$6) RETURNING user_id`,
        [data.email, data.username, passwordHash, data.first_name, data.last_name, data.creative_role]);
      const userId: number = inserted.rows[0].user_id;
      const session = await insertSession(db, userId, config, now());
      return { session, user: await getSelf(db, userId) };
    });
    sendSession(res, result.session, config);
    res.status(201).json({ user: result.user });
  });
  router.post('/login', async (req, res) => {
    const data = loginSchema.parse(req.body);
    // Both known and unknown accounts perform the same password KDF.
    dummyHash ??= hashPassword(randomBytes(32).toString('hex'));
    const fallback = await dummyHash;
    const result = await transaction(pool, async db => {
      // Serialize login vs password/email changes; no session may be issued
      // using credentials that were changed during verification.
      const found = await db.query('SELECT user_id, password_hash FROM users WHERE email = $1 FOR UPDATE', [data.email]);
      const user = found.rows[0];
      const valid = await verifyPassword(data.password, user?.password_hash ?? fallback);
      if (!user || !valid) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
      const time = now();
      await db.query('DELETE FROM sessions WHERE user_id = $1 AND (expires_at <= $2 OR last_seen_at <= $3)',
        [user.user_id, time, new Date(time.getTime() - config.sessionIdleMinutes * 60000)]);
      return { session: await insertSession(db, user.user_id, config, time), user: await getSelf(db, user.user_id) };
    });
    sendSession(res, result.session, config);
    res.json({ user: result.user });
  });
  router.get('/me', requireAuth(pool, config, now), async (req, res) => {
    res.json({ user: await getSelf(pool, req.userId!) });
  });
  router.post('/logout', requireAuth(pool, config, now), async (req, res) => {
    await pool.query('DELETE FROM sessions WHERE token_hash = $1', [req.sessionTokenHash]);
    res.clearCookie(COOKIE, cookieOptions(config));
    res.status(204).end();
  });
  return router;
}
