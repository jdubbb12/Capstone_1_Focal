import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
describe('local database tooling', () => {
  it('rejects unknown commands without changing the database', () => {
    const script = fileURLToPath(new URL('../scripts/local-db.mjs', import.meta.url));
    let output = '';
    try { execFileSync(process.execPath, [script, 'destroy'], { encoding: 'utf8', stdio: 'pipe' }); }
    catch (error: any) { output = String(error.stderr); }
    expect(output).toContain('Usage: local-db.mjs init|start|stop|status');
  });
});
