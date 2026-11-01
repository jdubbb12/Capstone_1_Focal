import { z } from 'zod';
import type { AppConfig } from './app.js';
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().min(1).default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  CLIENT_ORIGIN: z.url().refine(value => {
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) && url.origin === value;
    } catch { return false; }
  }).default('http://localhost:5173'),
  DATABASE_URL: z.url().refine(value => {
    try { return ['postgres:', 'postgresql:'].includes(new URL(value).protocol); }
    catch { return false; }
  }),
  SESSION_IDLE_MINUTES: z.coerce.number().int().min(1).max(1440).default(30),
  SESSION_MAX_HOURS: z.coerce.number().int().min(1).max(720).default(24),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(10).default(0),
});
export function readConfig(env: NodeJS.ProcessEnv): AppConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map(i => i.path.join('.')))];
    throw new Error(`Invalid server configuration: ${fields.join(', ')}. See .env.example.`);
  }
  const e = parsed.data;
  if (e.NODE_ENV === 'production' && !e.CLIENT_ORIGIN.startsWith('https://')) {
    throw new Error('Invalid server configuration: production CLIENT_ORIGIN must use HTTPS.');
  }
  return { nodeEnv: e.NODE_ENV, host: e.HOST, port: e.PORT, clientOrigin: e.CLIENT_ORIGIN,
    databaseUrl: e.DATABASE_URL, sessionIdleMinutes: e.SESSION_IDLE_MINUTES,
    sessionMaxHours: e.SESSION_MAX_HOURS, trustProxyHops: e.TRUST_PROXY_HOPS, authRateLimit: 30 };
}
