import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
const entry = fileURLToPath(new URL('../src/index.ts', import.meta.url));
describe('server startup', () => {
  it.each([
    { DATABASE_URL: '' },
    { DATABASE_URL: 'postgresql://test:example@localhost/focal_test', PORT: 'invalid' },
    { DATABASE_URL: 'postgresql://test:example@localhost/focal_test', CLIENT_ORIGIN: 'not-a-url' },
  ])('fails closed with safe diagnostics for invalid configuration %j', invalid => {
    const result = spawnSync(process.execPath, ['--import', 'tsx', entry], {
      env: { ...process.env, ...invalid }, encoding: 'utf8', timeout: 10000,
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Invalid server configuration');
    expect(result.stderr).not.toContain('test:example');
  });
});
