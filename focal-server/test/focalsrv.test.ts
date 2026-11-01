import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { account, clearUsers, config, pool, setupDatabase } from '../tests/helpers.js';

beforeAll(setupDatabase);
beforeEach(clearUsers);
afterAll(async () => {
  try { await clearUsers(); }
  finally { await pool.end(); }
});
const app = createApp({ pool, config });
const credentials = { ...account, email: '  TestAcc@Test.com  ', username: 'TestAccount' };

describe('POST /api/auth/signup', () => {
  it('returns 201 Created with the normalized registered user', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send(credentials)
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(201);

    expect(response.body.user).toMatchObject({
      email: 'testacc@test.com', username: 'testaccount',
      first_name: account.first_name, last_name: account.last_name,
      creative_role: account.creative_role,
    });
  });
});

describe('POST /api/auth/login', () => {
  it('returns 200 OK with the registered user after normalized email login', async () => {
    await request(app).post('/api/auth/signup').send(credentials).expect(201);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: ' TESTACC@TEST.COM ', password: credentials.password })
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200);

    expect(response.body.user).toMatchObject({ email: 'testacc@test.com', username: 'testaccount' });
  });
});
