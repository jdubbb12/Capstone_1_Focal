# Connected Focal client and server

## What works now

Use the Vue application at **http://localhost:5173**. Port 3000 remains the JSON
API; visiting its root `/` still returns the intentional endpoint-not-found error.

- Signup now collects first/last name, username, email, password, and creative role,
  creates a real account, sets its server session cookie, and opens the profile.
- `/login` submits email/password to the server and displays failed-login errors.
- Reloading restores the current user from `/api/auth/me`; no credentials or JWTs
  are written to localStorage or sessionStorage.
- Profile, feed preview, boards preview, annotation preview, and edit-profile pages
  require a server-validated session. After expiration, sign in again.
- Every account menu displays the signed-in username and performs real logout.
  If the server cannot be reached, logout shows an error rather than falsely
  claiming the cookie/session was revoked.
- The profile displays actual names, role, bio, username, and selected interests.
- Edit Profile has separate **Save Profile**, **Save Interests**, **Change Email**,
  and **Change Password** forms. Their saves are independent, not an implied
  multi-request transaction. Each has validation, errors, and in-progress feedback.
- Email/password changes require the current password and sign out all sessions.
  The client returns to login with an explanation; sign in with the new credentials.
- Server/network failures are visible and retryable. An old in-flight session or
  profile response cannot silently restore local signed-in state after logout.

**Still previews:** artwork uploads/storage, portfolio statistics, discovery
results/filters, inspiration boards, and spatial annotation/comment saving. The
existing sample artwork remains labeled as design-preview content, not database
records belonging to the account. Profile photos and Google sign-in are also not
implemented. Their unavailable state must not be mistaken for successful saving.

## Start both sides

These commands are for the existing Windows checkout, in PowerShell/Windows
Terminal. The database has already been initialized; do not reset or reinitialize it.

```powershell
cd "C:\Users\Elisa Arbaiza\Capstone_1_Focal"

# New frontend dependencies were added for tests. After pulling these changes,
# restore the exact locked frontend packages.
npm ci --prefix focal-client

# Start the isolated PostgreSQL instance; this does not delete data.
npm run db:local:start --prefix focal-server

# Apply any pending database migrations; safe to rerun.
npm run db:migrate --prefix focal-server

# Start both Express and Vite in this terminal. Ctrl+C stops them.
npm run dev
```

Open **http://localhost:5173** and create your own account, or choose **Log in**
for an account already created in this application's database. No demo accounts
or passwords were seeded. Temporary browser-test accounts are removed afterward.

On a fresh clone, also run `npm ci` at the root and `npm ci --prefix focal-server`.
Follow `BACKEND_SETUP.md` for first-time database initialization or a custom DB.
Do not run the legacy `FocalDB.sql` against this application's database.

If a client/server is already running in another terminal, stop it before starting
the combined command. Vite is fixed to 5173 and fails explicitly if it is occupied,
rather than silently moving to a port that disagrees with the allowed Origin.

## How the connection works

```text
Browser: http://localhost:5173
    fetch('/api/...', { credentials: 'include' })
        -> Vite /api proxy -> http://127.0.0.1:3000/api/...
            -> Express authentication/validation -> PostgreSQL
```

`src/lib/api.ts` is the shared JSON transport. `src/stores/auth.ts` holds the
reactive current user in memory and applies server responses. `src/router/guards.ts`
checks the session before entering protected routes and permits only known
internal post-login return paths. `AccountMenu.vue` shares username/logout behavior.
The API continues to enforce authorization independently; route guards are not a
replacement for server security.

The browser receives an opaque HttpOnly `focal_session` cookie; JavaScript does
not read or store its value. The proxy keeps browser API traffic on the client
origin. It does not weaken the backend's Origin checks or enable wildcard CORS.

Optional `focal-client/.env` setting (see `.env.example`):

```dotenv
API_PROXY_TARGET=http://127.0.0.1:3000
```

This is a **Vite server-side** setting, not a `VITE_`-prefixed browser variable.
Do not put database credentials or other secrets in frontend configuration. Keep
`focal-server/.env` private. The server's `CLIENT_ORIGIN` should stay
`http://localhost:5173` for normal development.

A production `dist/` build uses the same relative `/api` URLs. Deploy the frontend
and API behind one HTTPS origin with an `/api` reverse-proxy rule and an SPA route
fallback. Vite's development proxy is not a production server. If using
`npm run preview` on 4173 locally, configure the backend's allowed `CLIENT_ORIGIN`
to that exact preview origin first, then restart the backend; otherwise writes
are correctly rejected. Restore 5173 when returning to normal development.

## Verification

From the repository root:

```powershell
# Unit/component tests and strict client/e2e TypeScript checks.
npm test --prefix focal-client
npm run typecheck --prefix focal-client
npm run build --prefix focal-client
npm audit --prefix focal-client

# Backend regression tests use the dedicated _test database.
npm test --prefix focal-server
npm run typecheck --prefix focal-server
npm run build --prefix focal-server
npm audit --prefix focal-server

# Install Chromium once, then run real browser/database integration scenarios.
cd focal-client
npx playwright install chromium
npm run test:e2e
```

E2E tests start their **own** backend on 3001 and client on 5174, use
`TEST_DATABASE_URL` from the backend environment, and refuse a database name not
ending in `_test` or a normalized match to the development database identity
(host, port, and decoded database name, independent of credentials/options). They
refuse to reuse existing servers on those ports. Each scenario uses uniquely
named synthetic accounts and deletes only those accounts, verifying deletion.
No development account data is used. Run backend tests and E2E sequentially, not
at the same time, because both use the dedicated test database.

The Chromium scenarios exercise actual signup/login/logout, cookie restoration,
profile/interests persistence, email/password changes and old-credential rejection,
idle expiration, conflicts, and network-error UI. Database queries verify saved
state. A decorative-icon accessibility regression test prevents icon fonts from
changing the signup submit button's spoken name. Tests also guard against stale
responses reviving signed-in UI after logout.

Playwright traces/screenshots/results are under ignored `focal-client/.local/`.
The dev-only glob/minimatch overrides select advisory-patched versions of
transitive test-formatting dependencies; runtime dependencies were not replaced.

## Troubleshooting

- **Port 3000 shows NOT_FOUND:** use the frontend on 5173; API health lives at
  `/api/health` and `/api/health/ready`.
- **Cannot reach the server / server unavailable:** start PostgreSQL and Express,
  then retry. Check `/api/health/ready` directly and through the Vite origin.
- **Origin not permitted:** use `localhost:5173`, not a different port/hostname,
  or intentionally update the server's exact `CLIENT_ORIGIN` and restart it.
- **Blank profile after idle time:** navigate/sign in again; expired sessions are
  not refreshed indefinitely in the background.
- **Username conflict:** choose another username. Usernames are lowercase letters,
  digits, and underscores; existing email/username uniqueness is enforced by PG.
- **Profile saved but an interest save failed:** retry just Save Interests. The
  separate forms deliberately do not pretend both requests are one transaction.
- **Email/password changed:** all sessions were revoked intentionally. Use the
  new credentials at `/login`.
