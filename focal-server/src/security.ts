import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const N = 131072;
const r = 8;
const p = 1;
function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => scrypt(password, salt, 64,
    { N, r, p, maxmem: 256 * 1024 * 1024 },
    (error, key) => error ? reject(error) : resolve(key)));
}
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `scrypt$${N}$${r}$${p}$${salt.toString('hex')}$${key.toString('hex')}`;
}
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt' || parts[1] !== String(N) || parts[2] !== String(r) || parts[3] !== String(p)
      || !/^[0-9a-f]{32}$/.test(parts[4]!) || !/^[0-9a-f]{128}$/.test(parts[5]!)) return false;
  const actual = await derive(password, Buffer.from(parts[4]!, 'hex'));
  return timingSafeEqual(actual, Buffer.from(parts[5]!, 'hex'));
}
export function newSessionToken(): string { return randomBytes(32).toString('hex'); }
export function tokenHash(token: string): string { return createHash('sha256').update(token).digest('hex'); }
