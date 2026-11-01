import { defineConfig, devices } from '@playwright/test'
import { requireTestDatabase } from './scripts/test-database.mjs'
import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'
config({ path: fileURLToPath(new URL('../focal-server/.env', import.meta.url)), quiet: true })
requireTestDatabase(process.env.TEST_DATABASE_URL, process.env.DATABASE_URL)
export default defineConfig({
  testDir: './e2e', fullyParallel: false, workers: 1, retries: 0, timeout: 90000,
  expect: { timeout: 10000 }, reporter: 'list', outputDir: '.local/playwright-results',
  use: { baseURL: 'http://localhost:5174', actionTimeout: 15000, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    { command: 'node scripts/e2e-server.mjs', url: 'http://127.0.0.1:3001/api/health/ready', timeout: 60000, reuseExistingServer: false },
    { command: 'npm run dev -- --port 5174', url: 'http://localhost:5174', env: { API_PROXY_TARGET: 'http://127.0.0.1:3001' }, timeout: 60000, reuseExistingServer: false },
  ],
})
