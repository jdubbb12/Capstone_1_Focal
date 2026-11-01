import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { account, clearUsers, config, pool, setupDatabase } from './helpers.js';

beforeAll(setupDatabase);
beforeEach(clearUsers);
afterAll(() => pool.end());
const app = createApp({ pool, config });
describe('signup', () => {
  it('registers a normalized account, hashes the password and starts an HttpOnly session', async () => {
    const response = await request(app).post('/api/auth/signup').send({ ...account, email: '  ELISA@Example.com  ', username: 'Elisa' });
    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({ email: account.email, username: account.username, first_name: 'Elisa' });
    expect(response.body.user.password_hash).toBeUndefined();
    expect(response.body.token).toBeUndefined();
    expect(response.headers['set-cookie']![0]).toMatch(/focal_session=.*HttpOnly/);
    expect(response.headers['set-cookie']![0]).toContain('SameSite=Lax');
    const stored = (await pool.query('SELECT password_hash FROM users')).rows[0].password_hash;
    expect(stored).not.toContain(account.password);
    expect(stored).toMatch(/^scrypt\$/);
    const session = (await pool.query('SELECT token_hash FROM sessions')).rows[0];
    expect(session.token_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(response.headers['set-cookie']![0]).not.toContain(session.token_hash);
  });
  it('rejects duplicate email and username case insensitively', async () => {
    expect((await request(app).post('/api/auth/signup').send(account)).status).toBe(201);
    expect((await request(app).post('/api/auth/signup').send({ ...account, email: 'ELISA@example.com', username: 'other' })).status).toBe(409);
    expect((await request(app).post('/api/auth/signup').send({ ...account, email: 'other@example.com', username: 'ELISA' })).status).toBe(409);
  });
  it.each([
    { password: 'short' }, { email: 'invalid' }, { first_name: '' }, { username: 'x; DROP TABLE users;' },
    { creative_role: 'administrator' }, { password_hash: 'injected' },
  ])('rejects invalid signup input: %j', async (invalid) => {
    const response = await request(app).post('/api/auth/signup').send({ ...account, ...invalid });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(JSON.stringify(response.body)).not.toContain(account.password);
    expect((await pool.query('SELECT count(*)::int AS n FROM users')).rows[0].n).toBe(0);
  });
});

describe('login and sessions', () => {
  it('authenticates by email and rejects incorrect or unknown credentials identically', async () => {
    await request(app).post('/api/auth/signup').send(account);
    const response = await request(app).post('/api/auth/login').send({ email: 'ELISA@EXAMPLE.COM', password: account.password });
    expect(response.status).toBe(200);
    const cookie = response.headers['set-cookie']![0]!;
    const me = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(me.status).toBe(200);
    expect(me.body.user.username).toBe(account.username);
    const wrong = await request(app).post('/api/auth/login').send({ email: account.email, password: 'wrong password' });
    const unknown = await request(app).post('/api/auth/login').send({ email: 'unknown@example.com', password: account.password });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body).toEqual(unknown.body);
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    expect((await request(app).get('/api/auth/me').set('Cookie', 'focal_session=forged')).status).toBe(401);
  });
  it('revokes server-side sessions on logout, including cookie replay', async () => {
    const response = await request(app).post('/api/auth/signup').send(account);
    const cookie = response.headers['set-cookie']![0]!;
    expect((await request(app).post('/api/auth/logout').set('Cookie', cookie)).status).toBe(204);
    expect((await request(app).get('/api/auth/me').set('Cookie', cookie)).status).toBe(401);
    expect((await pool.query('SELECT count(*)::int AS n FROM sessions')).rows[0].n).toBe(0);
  });
  it('slides the inactivity window but enforces both idle and absolute expiration', async () => {
    let clock = new Date('2026-10-31T12:00:00Z');
    const timed = createApp({ pool, config, now: () => clock });
    const signup = await request(timed).post('/api/auth/signup').send(account);
    const cookie = signup.headers['set-cookie']![0]!;
    clock = new Date('2026-10-31T12:29:00Z');
    expect((await request(timed).get('/api/auth/me').set('Cookie', cookie)).status).toBe(200);
    clock = new Date('2026-10-31T12:58:00Z');
    expect((await request(timed).get('/api/auth/me').set('Cookie', cookie)).status).toBe(200);
    clock = new Date('2026-10-31T13:29:00Z');
    expect((await request(timed).get('/api/auth/me').set('Cookie', cookie)).status).toBe(401);
    const login = await request(timed).post('/api/auth/login').send({ email: account.email, password: account.password });
    const newCookie = login.headers['set-cookie']![0]!;
    await pool.query(`UPDATE sessions SET last_seen_at = expires_at - interval '1 minute'`);
    clock = new Date(clock.getTime() + 24 * 3600000);
    expect((await request(timed).get('/api/auth/me').set('Cookie', newCookie)).status).toBe(401);
  });
});

describe('profile and account management', () => {
  it('edits only the signed-in profile and exposes a safe public profile', async () => {
    const signup = await request(app).post('/api/auth/signup').send(account);
    const cookie = signup.headers['set-cookie']![0]!;
    const update = await request(app).patch('/api/users/me').set('Cookie', cookie).send({
      first_name: 'New Name', creative_role: 'architect', bio: "Artist's profile; DROP TABLE users; --",
    });
    expect(update.status).toBe(200);
    expect(update.body.user.first_name).toBe('New Name');
    expect(update.body.user.creative_role).toBe('architect');
    const profile = await request(app).get('/api/users/elisa');
    expect(profile.status).toBe(200);
    expect(profile.body.user.username).toBe('elisa');
    for (const field of ['email', 'password', 'password_hash', 'token_hash']) expect(profile.body.user[field]).toBeUndefined();
    expect((await request(app).patch('/api/users/me').send({ bio: 'unauthorized' })).status).toBe(401);
    expect((await request(app).patch('/api/users/me').set('Cookie', cookie).send({ user_id: 99 })).status).toBe(400);
    expect((await request(app).patch('/api/users/me').set('Cookie', cookie).send({})).status).toBe(400);
    expect((await request(app).get('/api/users/no_such_user')).status).toBe(404);
  });
  it('requires the current password to change email and revokes existing sessions', async () => {
    const signup = await request(app).post('/api/auth/signup').send(account);
    const cookie = signup.headers['set-cookie']![0]!;
    const patchEmail = (body: object) => request(app).patch('/api/users/me').set('Cookie', cookie).send(body);
    expect((await patchEmail({ email: 'new@example.com' })).status).toBe(400);
    expect((await patchEmail({ email: 'new@example.com', current_password: 'incorrect' })).status).toBe(401);
    const success = await patchEmail({ email: 'NEW@example.com', current_password: account.password });
    expect(success.status).toBe(200);
    expect(success.body.user.email).toBe('new@example.com');
    expect((await request(app).get('/api/auth/me').set('Cookie', cookie)).status).toBe(401);
    expect((await request(app).post('/api/auth/login').send({ email: account.email, password: account.password })).status).toBe(401);
    expect((await request(app).post('/api/auth/login').send({ email: 'new@example.com', password: account.password })).status).toBe(200);
  });
  it('changes passwords with reauthentication and revokes every old session', async () => {
    const signup = await request(app).post('/api/auth/signup').send(account);
    const cookie = signup.headers['set-cookie']![0]!;
    const second = await request(app).post('/api/auth/login').send({ email: account.email, password: account.password });
    const secondCookie = second.headers['set-cookie']![0]!;
    const change = (body: object) => request(app).put('/api/users/me/password').set('Cookie', cookie).send(body);
    expect((await change({ current_password: 'wrong', new_password: 'new secure password 123' })).status).toBe(401);
    expect((await change({ current_password: account.password, new_password: 'short' })).status).toBe(400);
    expect((await change({ current_password: account.password, new_password: 'new secure password 123' })).status).toBe(204);
    for (const old of [cookie, secondCookie]) expect((await request(app).get('/api/auth/me').set('Cookie', old)).status).toBe(401);
    expect((await request(app).post('/api/auth/login').send({ email: account.email, password: account.password })).status).toBe(401);
    expect((await request(app).post('/api/auth/login').send({ email: account.email, password: 'new secure password 123' })).status).toBe(200);
  });
  it('rolls back a conflicting account change without losing the session', async () => {
    const signup = await request(app).post('/api/auth/signup').send(account);
    const cookie = signup.headers['set-cookie']![0]!;
    await request(app).post('/api/auth/signup').send({ ...account, email: 'other@example.com', username: 'other' });
    expect((await request(app).patch('/api/users/me').set('Cookie', cookie).send({ username: 'other', bio: 'should not persist' })).status).toBe(409);
    const me = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(me.status).toBe(200);
    expect(me.body.user.bio).toBe('');
  });
});

describe('interests', () => {
  it('lists the catalog and atomically replaces the signed-in users interests', async () => {
    const catalog = await request(app).get('/api/interests');
    expect(catalog.status).toBe(200);
    expect(catalog.body.interests.length).toBeGreaterThan(0);
    const signup = await request(app).post('/api/auth/signup').send(account);
    const cookie = signup.headers['set-cookie']![0]!;
    const ids = catalog.body.interests.slice(0, 2).map((i: any) => i.interest_id);
    const set = (interest_ids: unknown) => request(app).put('/api/users/me/interests').set('Cookie', cookie).send({ interest_ids });
    const success = await set(ids);
    expect(success.status).toBe(200);
    expect(success.body.user.interests.map((i: any) => i.interest_id).sort()).toEqual([...ids].sort());
    expect((await set([ids[0], ids[0]])).status).toBe(400);
    expect((await set([999999])).status).toBe(400);
    expect((await set(['1; DROP TABLE users; --'])).status).toBe(400);
    const unchanged = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(unchanged.body.user.interests).toHaveLength(2);
    expect((await set([])).body.user.interests).toEqual([]);
  });
});

describe('HTTP security', () => {
  it('allows the configured Vue origin with credentials and blocks cross-site writes', async () => {
    const preflight = await request(app).options('/api/auth/signup').set('Origin', config.clientOrigin)
      .set('Access-Control-Request-Method', 'POST').set('Access-Control-Request-Headers', 'content-type');
    expect(preflight.status).toBe(204);
    expect(preflight.headers['access-control-allow-origin']).toBe(config.clientOrigin);
    expect(preflight.headers['access-control-allow-credentials']).toBe('true');
    const blocked = await request(app).post('/api/auth/signup').set('Origin', 'https://attacker.example').send(account);
    expect(blocked.status).toBe(403);
    const noOrigin = await request(app).post('/api/auth/signup').set('Sec-Fetch-Site', 'cross-site').send(account);
    expect(noOrigin.status).toBe(403);
    const allowed = await request(app).post('/api/auth/signup').set('Origin', config.clientOrigin).send(account);
    expect(allowed.status).toBe(201);
    expect(allowed.headers['cache-control']).toBe('no-store');
  });
  it('returns JSON errors for malformed, oversized, compressed, and unknown requests', async () => {
    const malformed = await request(app).post('/api/auth/signup').set('Content-Type', 'application/json').send('{');
    expect(malformed.status).toBe(400);
    expect(malformed.body.error.code).toBe('INVALID_JSON');
    const oversized = await request(app).post('/api/auth/signup').send({ bio: 'x'.repeat(40000) });
    expect(oversized.status).toBe(413);
    const compressed = await request(app).post('/api/auth/signup').set('Content-Encoding', 'gzip').send(account);
    expect(compressed.status).toBe(415);
    const missing = await request(app).get('/api/not-found');
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe('NOT_FOUND');
    expect(JSON.stringify(malformed.body)).not.toContain('SyntaxError');
  });
  it('rate limits authentication attempts before running more password checks', async () => {
    const limited = createApp({ pool, config: { ...config, authRateLimit: 2 } });
    for (let i = 0; i < 2; i++) expect((await request(limited).post('/api/auth/login').send({ email: 'none@example.com', password: 'wrong' })).status).toBe(401);
    const response = await request(limited).post('/api/auth/login').send({ email: 'none@example.com', password: 'wrong' });
    expect(response.status).toBe(429);
    expect(response.body.error.code).toBe('RATE_LIMITED');
    expect(response.headers['retry-after']).toBeTruthy();
  });
});

describe('HTTP foundation', () => {
  it('serves liveness and database readiness without leaking configuration', async () => {
    const live = await request(app).get('/api/health');
    expect(live.status).toBe(200);
    expect(live.body).toEqual({ status: 'ok' });
    const ready = await request(app).get('/api/health/ready');
    expect(ready.status).toBe(200);
    expect(ready.body).toEqual({ status: 'ready' });
    expect(live.headers['x-powered-by']).toBeUndefined();
    expect(live.headers['x-content-type-options']).toBe('nosniff');
    expect(live.headers['x-request-id']).toBeTruthy();
  });
});
