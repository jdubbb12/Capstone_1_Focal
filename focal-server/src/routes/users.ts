import { Router } from 'express';
import type { Pool } from 'pg';
import { z } from 'zod';
import type { AppConfig } from '../app.js';
import { transaction } from '../db/transaction.js';
import { ApiError } from '../errors.js';
import { hashPassword, verifyPassword } from '../security.js';
import { requireAuth } from '../session.js';
import { getSelf } from '../users.js';
import { COOKIE, cookieOptions, emailSchema, nameSchema, passwordSchema, roleSchema, usernameSchema } from './auth.js';

const profileSchema = z.strictObject({
  first_name: nameSchema.optional(), last_name: nameSchema.optional(), username: usernameSchema.optional(),
  email: emailSchema.optional(), current_password: z.string().min(1).max(128).optional(),
  creative_role: roleSchema.optional(), bio: z.string().trim().max(1000).optional(),
}).refine(data => Object.keys(data).some(k => k !== 'current_password'), 'At least one profile field is required.')
  .refine(data => data.email === undefined || data.current_password !== undefined, 'Current password is required to change email.');
const changePasswordSchema = z.strictObject({ current_password: z.string().min(1).max(128), new_password: passwordSchema });
const interestsSchema = z.strictObject({ interest_ids: z.array(z.number().int().positive().max(2147483647)).max(50)
  .refine(ids => new Set(ids).size === ids.length, 'Duplicate interests are not allowed.') });

export function userRoutes(pool: Pool, config: AppConfig, now: () => Date) {
  const router = Router();
  const auth = requireAuth(pool, config, now);
  router.patch('/me', auth, async (req, res) => {
    const data = profileSchema.parse(req.body);
    const user = await transaction(pool, async db => {
      const found = await db.query('SELECT password_hash FROM users WHERE user_id = $1 FOR UPDATE', [req.userId]);
      if (!found.rowCount) throw new ApiError(401, 'UNAUTHORIZED', 'Sign in to continue.');
      if (data.email !== undefined && !await verifyPassword(data.current_password!, found.rows[0].password_hash)) {
        throw new ApiError(401, 'INVALID_CREDENTIALS', 'Current password is incorrect.');
      }
      await db.query(`UPDATE users SET
        first_name = COALESCE($2,first_name), last_name = COALESCE($3,last_name), username = COALESCE($4,username),
        email = COALESCE($5,email), creative_role = COALESCE($6,creative_role), bio = COALESCE($7,bio), updated_at = $8
        WHERE user_id = $1`, [req.userId, data.first_name, data.last_name, data.username, data.email, data.creative_role, data.bio, now()]);
      if (data.email !== undefined) await db.query('DELETE FROM sessions WHERE user_id = $1', [req.userId]);
      return getSelf(db, req.userId!);
    });
    if (data.email !== undefined) res.clearCookie(COOKIE, cookieOptions(config));
    res.json({ user });
  });
  router.put('/me/password', auth, async (req, res) => {
    const data = changePasswordSchema.parse(req.body);
    await transaction(pool, async db => {
      const found = await db.query('SELECT password_hash FROM users WHERE user_id = $1 FOR UPDATE', [req.userId]);
      if (!found.rowCount || !await verifyPassword(data.current_password, found.rows[0].password_hash)) {
        throw new ApiError(401, 'INVALID_CREDENTIALS', 'Current password is incorrect.');
      }
      const hash = await hashPassword(data.new_password);
      await db.query('UPDATE users SET password_hash = $2, updated_at = $3 WHERE user_id = $1', [req.userId, hash, now()]);
      await db.query('DELETE FROM sessions WHERE user_id = $1', [req.userId]);
    });
    res.clearCookie(COOKIE, cookieOptions(config));
    res.status(204).end();
  });
  router.put('/me/interests', auth, async (req, res) => {
    const { interest_ids } = interestsSchema.parse(req.body);
    const user = await transaction(pool, async db => {
      // Serialize replacements for one account, without deleting another users interests.
      const found = await db.query('SELECT user_id FROM users WHERE user_id = $1 FOR UPDATE', [req.userId]);
      if (!found.rowCount) throw new ApiError(401, 'UNAUTHORIZED', 'Sign in to continue.');
      const catalog = await db.query('SELECT interest_id FROM interests WHERE interest_id = ANY($1::int[])', [interest_ids]);
      if (catalog.rowCount !== interest_ids.length) throw new ApiError(400, 'INVALID_INTERESTS', 'One or more interests do not exist.');
      await db.query('DELETE FROM user_interests WHERE user_id = $1', [req.userId]);
      await db.query('INSERT INTO user_interests (user_id, interest_id) SELECT $1, unnest($2::int[])', [req.userId, interest_ids]);
      return getSelf(db, req.userId!);
    });
    res.json({ user });
  });
  router.get('/:username', async (req, res) => {
    const username = usernameSchema.parse(req.params.username);
    const found = await pool.query('SELECT user_id FROM users WHERE username = $1', [username]);
    if (!found.rowCount) throw new ApiError(404, 'NOT_FOUND', 'Profile not found.');
    const self = await getSelf(pool, found.rows[0].user_id);
    const { user_id, first_name, last_name, creative_role, bio, interests, created_at } = self;
    res.json({ user: { user_id, username, first_name, last_name, creative_role, bio, interests, created_at } });
  });
  return router;
}
