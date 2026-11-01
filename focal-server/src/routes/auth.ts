<<<<<<< Updated upstream
/*

auth.ts - Diego V.
Responsible for the server-side authentication checks.
TODO: Proper testing and validation of this code.

*/
// Libs: Express for HTTP requests, etc, bcrypt for hashing, JSONWebToken for sesisons, and pg for PostgreSQL
import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jsonWT from 'jsonwebtoken';
import { Pool } from 'pg';

const router = Router();
const database = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
const DUPLICATE_ITEM_VIOLATION = '23505'

router.post('/signup', async (req: Request, res: Response) => {
    const { email, password, username } = req.body;
    //console.log(req.body);
    const client = await database.connect();

    // We do this in a try, catch block as to catch any potential server-sided error and report that back as a JSON object.
    try {
        // Waiting for the client to properly connect to the Database (in this case, the script) before starting, and once we connect we submit a BEGIN
        // ensure safe and proper transactions.
        await client.query('BEGIN');

        // Hashing the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const result = await client.query(
            "INSERT INTO user_login (email, username, last_login) VALUES ($1, $2, CURRENT_DATE) RETURNING user_id, email, username",
            [email, username]
        );

        // Stores the found user, the first row, into the newUser variable. 
        const newUser = result.rows[0];

        await client.query(
            "INSERT INTO user_pass_hash (user_id, user_Hash) VALUES ($1, $2)",
            [newUser.user_id, passwordHash]
        );

        await client.query("COMMIT"); // Ending our query, thus "committing" (ha, get it?) our data to the database. 

        // Signing our user token with our very secure secret. Also, not allowing a session to exist for longer than 7 days.
        const token = jsonWT.sign({ userID: newUser.user_id }, JWT_SECRET, { expiresIn: '7d' });

        // Returning to the client their user account and the session token.
        res.status(201).json({ user: newUser, token });
    }

    catch (error: any) {
        await client.query("ROLLBACK"); // Something has gone *really* wrong, we need to roll back to the previous state.

        // DUPLICATE_ITEM_VIOLATION refers to a PostgreSQL error code when an item is a duplicate, which means this account already exists.
        if (error.code === DUPLICATE_ITEM_VIOLATION) { return res.status(400).json({ error: 'Email already registered.' }); }

        res.status(500).json({ error: 'An internal server error has occured.' });
        //console.log(error);
    }
    finally {
        client.release(); // We disconnect from the server after everything is set.
    }
});

router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // For these queries, we are not inputting any user data onto the database, simply retrieving and updating the database. So, no need to ensure the connection.
        const result = await database.query(
            `SELECT user_login.user_id, user_login.email, user_login.username, user_pass_hash.user_hash
            FROM user_login JOIN user_pass_hash ON user_login.user_id = user_pass_hash.user_id
            WHERE user_login.email = $1`,
            [email]
        );

        // Keep this vague, we do not want to return if a specific email exists as a record.
        if (result.rows.length === 0) { return res.status(401).json({ error: "Invalid email or password." }); }

        const user = result.rows[0];

        const pwValid = await bcrypt.compare(password, user.user_hash)

        // The same situation as above, this time for a failed password attempt.
        if (!pwValid) { return res.status(401).json({ error: "Invalid email or password." }); }

        // Update the last_login variable to the current date, as the user is now given a session.
        await database.query('UPDATE user_login SET last_login = CURRENT_DATE WHERE user_id = $1', [user.user_id]);

        const token = jsonWT.sign({ userID: user.user_id }, JWT_SECRET, { expiresIn: '7d' });

        // We return the user JSON differently as we may need to seperately access each element and the user variable above would lead to a leaked password hash
        // and other unnecessary information.
        res.status(200).json({ user: { id: user.user_id, email: user.email, username: user.username }, token });
    }
    catch (error: any) {
        res.status(500).json({ error: "An internal server error has occured." });
        //console.log(error)
    }
});

export default router;
=======
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
>>>>>>> Stashed changes
