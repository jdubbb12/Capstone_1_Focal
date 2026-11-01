import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import pg from 'pg'
import { requireTestDatabase } from '../scripts/test-database.mjs'
import { randomUUID } from 'node:crypto'
const url = requireTestDatabase(process.env.TEST_DATABASE_URL, process.env.DATABASE_URL)
const pool = new pg.Pool({ connectionString: url })
let usernames: string[] = []
function fixture() {
  const username = `e2e_${randomUUID().replaceAll('-', '').slice(0, 14)}`
  usernames.push(username)
  return { username, email: `${username}@example.invalid`, password: 'E2E test-only passphrase 2026' }
}
async function signup(page: Page, account: ReturnType<typeof fixture>) {
  await page.goto('/')
  await page.getByLabel('First name', { exact: true }).fill('Example')
  await page.getByLabel('Last name', { exact: true }).fill('Artist')
  await page.getByLabel('Username', { exact: true }).fill(account.username)
  await page.getByLabel('Creative role', { exact: true }).selectOption('2d_artist')
  await page.getByLabel('Email address', { exact: true }).fill(account.email)
  await page.getByLabel('Password', { exact: true }).fill(account.password)
  await page.getByRole('button', { name: 'Create your account', exact: true }).click()
  await expect(page).toHaveURL('/profile')
}
async function login(page: Page, email: string, password: string) {
  await page.getByLabel('Email address', { exact: true }).fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
}
test.afterEach(async () => {
  await pool.query('DELETE FROM users WHERE username = ANY($1::text[])', [usernames])
  expect((await pool.query('SELECT count(*)::int AS n FROM users WHERE username = ANY($1::text[])', [usernames])).rows[0].n).toBe(0)
  usernames = []
})
test.afterAll(() => pool.end())

test('signup submit name stays stable when decorative icon CSS loads', async ({ page }) => {
  await page.goto('/')
  await page.addStyleTag({ content: '.bi-arrow-right::before { content: "→" !important; }' })
  await expect(page.locator('form button[type="submit"]')).toHaveAccessibleName('Create your account')
})

test('signup, session restore, profile/interests persistence, logout, and login', async ({ page }) => {
  const account = fixture()
  const crashes: string[] = []; page.on('pageerror', error => crashes.push(error.message))
  await page.goto('/edit-profile')
  await expect(page).toHaveURL(/\/login\?redirect=/)
  await signup(page, account)
  await expect(page.getByRole('heading', { name: 'Example Artist', exact: true })).toBeVisible()
  expect((await pool.query('SELECT email FROM users WHERE username=$1', [account.username])).rows[0].email).toBe(account.email)
  const cookie = (await page.context().cookies()).find(c => c.name === 'focal_session')
  expect(cookie?.httpOnly).toBe(true)
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Example Artist', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Edit Profile', exact: true }).last().click()
  const profile = page.getByTestId('profile-form')
  await profile.getByLabel('First name', { exact: true }).fill('Updated')
  await profile.getByLabel('Bio', { exact: true }).fill('Saved through the browser into PostgreSQL.')
  await profile.getByRole('button', { name: 'Save Profile', exact: true }).click()
  await expect(profile.getByRole('status')).toContainText(/saved/i)
  const interests = page.getByTestId('interests-form')
  await interests.getByRole('checkbox', { name: 'Architecture', exact: true }).check()
  await interests.getByRole('button', { name: 'Save Interests', exact: true }).click()
  await expect(interests.getByRole('status')).toContainText(/saved/i)
  await page.reload()
  await expect(profile.getByLabel('First name', { exact: true })).toHaveValue('Updated')
  await expect(interests.getByRole('checkbox', { name: 'Architecture', exact: true })).toBeChecked()
  const persisted = (await pool.query('SELECT first_name,bio FROM users WHERE username=$1', [account.username])).rows[0]
  expect(persisted.first_name).toBe('Updated'); expect(persisted.bio).toContain('PostgreSQL')
  await page.getByTestId('account-menu').click()
  await page.getByTestId('logout').click()
  await expect(page).toHaveURL(/\/login/)
  await login(page, account.email, 'incorrect test password')
  await expect(page.getByRole('alert')).toContainText('Email or password is incorrect.')
  await login(page, account.email, account.password)
  await expect(page).toHaveURL('/profile')
  await expect(page.getByRole('heading', { name: 'Updated Artist', exact: true })).toBeVisible()
  await expect(page.getByText('Architecture', { exact: true })).toBeVisible()
  expect(crashes).toEqual([])
})

test('email and password changes revoke sessions and require the new credentials', async ({ page }) => {
  const account = fixture(); await signup(page,account)
  await page.goto('/edit-profile')
  const passwordForm = page.getByTestId('password-form')
  const nextPassword = 'New E2E test-only passphrase 2026'
  await passwordForm.getByLabel('Current password', { exact: true }).fill(account.password)
  await passwordForm.getByLabel('New password', { exact: true }).fill(nextPassword)
  await passwordForm.getByLabel('Confirm new password', { exact: true }).fill(nextPassword)
  await passwordForm.getByRole('button', { name: 'Change Password', exact: true }).click()
  await expect(page).toHaveURL(/\/login.*credentials-changed/)
  await login(page, account.email, account.password)
  await expect(page.getByRole('alert')).toContainText('incorrect')
  await login(page, account.email, nextPassword)
  await expect(page).toHaveURL('/profile')
  await page.goto('/edit-profile')
  const emailForm = page.getByTestId('email-form')
  const nextEmail = `${account.username}_new@example.invalid`
  await emailForm.getByLabel('New email address', { exact: true }).fill(nextEmail)
  await emailForm.getByLabel('Current password', { exact: true }).fill(nextPassword)
  await emailForm.getByRole('button', { name: 'Change Email', exact: true }).click()
  await expect(page).toHaveURL(/\/login.*credentials-changed/)
  expect((await pool.query('SELECT email FROM users WHERE username=$1',[account.username])).rows[0].email).toBe(nextEmail)
  await login(page, account.email, nextPassword)
  await expect(page.getByRole('alert')).toContainText('incorrect')
  await login(page, nextEmail, nextPassword)
  await expect(page).toHaveURL('/profile')
  await pool.query(`UPDATE sessions SET last_seen_at = CURRENT_TIMESTAMP - interval '31 minutes' WHERE user_id = (SELECT user_id FROM users WHERE username=$1)`,[account.username])
  await page.getByRole('link', { name: 'Edit Profile', exact: true }).last().click()
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('status')).toContainText('session expired')
})

test('signup conflicts and an unreachable backend produce visible errors', async ({ page }) => {
  const account = fixture()
  const created = await page.request.post('/api/auth/signup', { data: { ...account, first_name:'Existing',last_name:'Artist',creative_role:'other' } })
  expect(created.status()).toBe(201)
  await page.context().clearCookies()
  await page.goto('/')
  await page.getByLabel('First name', { exact: true }).fill('Duplicate')
  await page.getByLabel('Last name', { exact: true }).fill('Artist')
  await page.getByLabel('Username', { exact: true }).fill(account.username)
  await page.getByLabel('Email address', { exact: true }).fill(account.email)
  await page.getByLabel('Password', { exact: true }).fill(account.password)
  await page.getByRole('button', { name:'Create your account',exact:true }).click()
  await expect(page.getByRole('alert')).toContainText('already in use')
  await page.route('**/api/**', route => route.abort('failed'))
  await page.goto('/login')
  await expect(page.getByRole('heading', { name:'Welcome back.' })).toBeVisible()
  await login(page,account.email,account.password)
  await expect(page.getByRole('alert').last()).toContainText('Cannot reach the server')
})
