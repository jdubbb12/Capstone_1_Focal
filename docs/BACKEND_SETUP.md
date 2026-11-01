# Focal backend — first implementation

## Scope

This adds a working Express 5 + TypeScript + PostgreSQL backend in `focal-server/`.
It keeps the team's existing stack and does not modify the Vue pages, diagrams, or
legacy `FocalDB.sql`. The Vue account screens are now connected; see
`FRONTEND_INTEGRATION.md` for the combined client/server workflow.

**Working now:** signup, login, logout, current account, public profiles, profile
updates, email/password changes, interests, database migrations, health checks,
validation, cookie sessions, basic HTTP security, and automated integration tests.

**Schema prepared, APIs not implemented yet:** artwork upload/storage and privacy
enforcement, revisions, 2D/3D/video annotation pins, replies, resolution/bump/ignore
workflows, discovery feed, inspiration boards, and reports/moderation. A database
column or table is not a completed feature.

## Run on this Windows computer

Use PowerShell, Windows Terminal, or Git Bash. PostgreSQL's `bin` directory must be
on PATH (`psql --version`, `initdb --version`, `pg_ctl --version`). If not, set the
`PG_BIN` environment variable to its installed `bin` directory. The installed
PostgreSQL 18 binaries were used for local verification. Node must be at least
22.18; this work was exercised with the existing Node 26 installation.

```powershell
# Enter the backend; all commands below run here.
cd "C:\Users\Elisa Arbaiza\Capstone_1_Focal\focal-server"

# Install exactly the versions in package-lock.json (first use / after pulling).
npm ci

# First-time setup on a new checkout ONLY. Creates a separate local database
# cluster, generates credentials, writes ignored .env, and creates dev/test DBs.
npm run db:local:init

# On this checkout initialization is already complete. After restarting Windows,
# start the existing local cluster instead; this does not reset its contents.
npm run db:local:start

# Apply versioned SQL migrations. Safe to rerun; never drops existing data.
npm run db:migrate

# Start the API with automatic reload on source changes. Ctrl+C stops it.
npm run dev
```

The API listens on `http://127.0.0.1:3000`. In a browser or a second terminal:

```powershell
curl.exe http://127.0.0.1:3000/api/health
curl.exe http://127.0.0.1:3000/api/health/ready
```

The first endpoint reports process liveness; the second checks access to the
migrated users table and returns 503 if the database is unavailable.

To run the existing client and backend together, start the database, apply the
migrations, then run the repository's existing `npm run dev` from the repository
root. The client must have its own dependencies installed. Account/session,
profile, credential-change, and interest UI wiring is now implemented; see
`FRONTEND_INTEGRATION.md`. Artwork and annotation APIs remain pending.

```powershell
# Run these from focal-server when needed:
npm run db:local:status  # inspect the dedicated cluster
npm run db:local:stop    # stop it without deleting any data
npm run typecheck       # strict TypeScript, including tests
npm test                # real HTTP + PostgreSQL integration tests
npm run build           # compile src/ to dist/
npm start               # run the compiled backend after building
npm audit               # dependency advisory scan
```

### Isolated local database

- Local cluster: `127.0.0.1:55432`, bound to loopback, SCRAM authentication.
- Development database: `focal_development`; test database: `focal_test`.
- Data/log/config: `focal-server/.local/`; connection strings: `focal-server/.env`.
- `.env`, `.local`, dependencies, build output, and coverage are ignored by git.
- Existing PostgreSQL on port 5432 is neither reconfigured nor used by this helper.
- The helper creates an isolated **development superuser**. Do not use its role,
  generated credentials, or this helper for production.
- Windows restarts stop this manually started cluster. Use `db:local:start` again.
- Init is repeatable for its own already-initialized directory, but refuses to
  overwrite an unrelated existing `.env` or database directory.
- Never delete `.local/postgres` to troubleshoot: that is the actual database data.
- Test commands require a dedicated database whose name ends in `_test`. Tests
  truncate test users and cascading test content, never the development database.

### Use a different PostgreSQL installation instead

Create **two empty databases** yourself and copy `.env.example` to `.env`. Set
`DATABASE_URL` and `TEST_DATABASE_URL` to their separate connection strings, then
run `npm run db:migrate`. Tests apply migrations to the test DB automatically.
Do not run `db:local:init` in this configuration. No credentials are committed.
Percent-encode special characters in PostgreSQL URL usernames/passwords.

Do not execute the legacy `FocalDB.sql` into the new database. It represents an
older schema and contains sample hashes/data, not real application credentials.
Existing legacy databases need a separately planned data migration; none is
attempted here, and that file remains untouched.

## Authentication and API contract

API prefix: `/api`. Full machine-readable contract: `docs/openapi.json` at the
repository root (import it into an OpenAPI-compatible API client).

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/health` | Public | Liveness |
| GET | `/health/ready` | Public | Database readiness |
| POST | `/auth/signup` | Public | Create account and session |
| POST | `/auth/login` | Public | Email/password login |
| GET | `/auth/me` | Session | Current account, including interests |
| POST | `/auth/logout` | Session | Revoke current session |
| PATCH | `/users/me` | Session | Edit name, username, role, bio; email requires current password |
| PUT | `/users/me/password` | Session + current password | Change password; revoke all sessions |
| PUT | `/users/me/interests` | Session | Replace interest selections, including empty list |
| GET | `/users/{username}` | Public | Profile without email or credential fields |
| GET | `/interests` | Public | Available interests |

Signup JSON (all fields required except `creative_role`, which defaults to `other`):

```json
{
  "email": "artist@example.com",
  "username": "artist_one",
  "password": "a long unique passphrase",
  "first_name": "Example",
  "last_name": "Artist",
  "creative_role": "2d_artist"
}
```

This is illustrative input, not a seeded account. Passwords must be 12–128
characters; usernames are 3–50 lowercase letters, digits, or underscores.
Emails/usernames are trimmed and normalized to lowercase and are unique ignoring
case. Names are trimmed, required, and limited to 80 characters. Roles are
`2d_artist`, `3d_designer`, `architect`, or `other`; bio is at most 1000 characters.
Unknown request fields are rejected rather than persisted.

Login uses `{ "email": "...", "password": "..." }`. Successful signup/login set
an opaque `focal_session` cookie with `HttpOnly`, `SameSite=Lax`, and `Path=/api`;
the response contains `{ "user": { ... } }`, never the password/hash/session token.
Cookies are marked `Secure` when `NODE_ENV=production`. Sessions expire after
30 minutes of inactivity or 24 hours total by default; both are configurable.
Authenticated requests slide only the inactivity window, not the absolute expiry.
There is no refresh JWT or token stored in localStorage. Revocation prevents
subsequent authentication; an already-authenticated request that is in flight may
still finish. Credential changes and login/session issuance are serialized with
user-row locks.

Profile edits use `PATCH /api/users/me` with any of `first_name`, `last_name`,
`username`, `creative_role`, or `bio`. Email edits also require `current_password`.
Changing email or password signs the account out on **all** devices, including
the current one. Log in again afterward. A conflict rolls back the entire edit.

Password changes use `{ "current_password": "...", "new_password": "..." }`.
Interest replacement uses `{ "interest_ids": [1, 2] }`, with unique positive
integer IDs from `GET /api/interests`. Unknown IDs return 400 without deleting
existing selections. To clear selections use an empty array.

The public profile contains names, username, creative role, bio, interests,
creation date, and user ID. It excludes email, password fields, and session data.
`GET /api/auth/me` is the private account endpoint.

### Connected Vue frontend

Use one hostname consistently: open the Vite client at `http://localhost:5173`
and use `http://localhost:3000` for browser API requests. Mixing browser
`localhost` and `127.0.0.1` makes them different cookie sites.

```ts
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})
const payload = await response.json()
if (!response.ok) throw new Error(payload.error.message)
```

Use `credentials: 'include'` for all session-backed requests. `CLIENT_ORIGIN`
defaults to `http://localhost:5173`; if Vite selects another port, update `.env`
and restart the API. It must be the exact scheme/hostname/port, without a trailing
slash or path. Cross-site mutations are rejected by Origin/Fetch-Metadata checks;
CLI clients without an Origin header can still use a cookie jar.

Expected error envelope:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Invalid request fields.", "fields": ["email"] } }
```

Typical statuses: 400 invalid fields/JSON; 401 not signed in or invalid
credentials; 403 disallowed origin; 404 missing endpoint/profile; 409 email or
username conflict; 413 oversized body; 415 unsupported encoding; 429 rate limit;
500 unexpected error; 503 database readiness failure. Logout/password success
returns 204 with no JSON body. Login failures use the same message for an unknown
email or incorrect password. Basic request logging uses generated request IDs,
not credentials, cookie values, SQL parameters, or request bodies.

## How the schema extends the diagrams

| Diagram entity | Table(s) | Requirement-driven additions |
|---|---|---|
| User | `users`, `sessions` | Password hash instead of plaintext password; names, role, bio, timestamps; hashed opaque sessions with idle/absolute expiration |
| Artwork | `artworks`, `artwork_interests` | Owner FK, caption, medium, private-by-default setting, timestamps, interest tags |
| Revision | `revisions` | Unique artwork/version pair; media type, private storage key, original filename, MIME type, byte size, notes |
| Comment | `comments` | Revision FK, author, same-revision parent/reply FK, category/status, coordinates/frame/mesh/camera, timestamps |
| InspirationBoard | `boards` | Owner FK, name, private-by-default setting |
| Board Items | `board_items` | Composite primary key prevents duplicate saves |
| Additional requirements | `interests`, `user_interests`, `reports` | Self-assigned interests and reporting targets/status |

There is no plaintext `password` column. Passwords use salted asynchronous scrypt;
only a SHA-256 digest of each high-entropy random session token is stored.
User values use parameterized PostgreSQL queries rather than SQL concatenation.

Comments attach to a specific revision, not just an artwork. Image/video X/Y
coordinates are normalized to `[0,1]` so different viewport sizes can render the
same pin. Video pins add a nonnegative frame index. Model pins use finite
model-space X/Y/Z, with optional mesh name and camera JSON. Replies reference a
comment on the same revision and do not carry a second spatial anchor. The future
annotation API must additionally validate anchor kind against revision media,
video timing bounds, ownership, visibility, and permitted status transitions.
Status values are `open`, `resolved`, `bumped`, and `ignored`; these are schema
values, not implemented transition endpoints.

Foreign keys enforce ownership/references, join-table primary keys prevent
duplicates, and indexes support expected owner/feed/revision queries. Deletion
cascades are deliberate schema rules; there is no account-deletion endpoint yet.
Media is a storage key on a revision, not a public static URL; no file-serving
route is exposed before privacy-aware storage is implemented.

Migrations live in `focal-server/migrations`. `schema_migrations` records a SHA-256
checksum, and a PostgreSQL advisory lock serializes concurrent runners. Each file
and its record commit in one transaction. Rerunning skips applied files; changing
an applied file fails instead of silently drifting the schema. Add a new
`002_description.sql` migration for future changes. No destructive down/reset
command is provided.

## Requirement coverage and next steps

| Requirement | Current status |
|---|---|
| R1 signup | Backend and Vue account UI implemented |
| R2 login | Backend and Vue login page implemented |
| R3 2D annotation | Schema only; upload + pin endpoints and UI pending |
| R4 3D pinning | Schema only; model storage/viewer/API validation pending |
| R5 frame annotation | Schema only; frame timing + video UI/API pending |
| R6 resolution tracking | Status/reply/revision schema only; dashboard/workflow pending |
| R7 discovery feed | Medium/index schema only; visibility-filtered feed pending |
| R8 content visibility | Private-by-default schema only; authorization and private media delivery pending |
| R9 account management | Backend and Vue names/email/password/profile forms implemented |
| R10 reporting/moderation | Report schema only; report endpoints and automatic moderation pending |
| R11 interests/tags | User-interest backend implemented; artwork tagging API pending |

Recommended next implementation: private-by-default artwork creation and
validated image uploads, authorized file delivery, revision creation, and 2D pin
endpoints. Add integration tests proving private art cannot leak through direct
URLs, feeds, profiles, boards, or feedback endpoints before exposing those APIs.

## Deployment limitations — not production ready

This foundation does not establish 90% availability, cross-platform latency,
accessible UI, or the two-click critique UX. Those need deployment monitoring,
backups/restore tests, browser/device testing, and the frontend implementation.
The requirements statement that the system “only stores user login information”
conflicts with profile/artwork/feedback requirements; this schema assumes it means
limiting sensitive credential data rather than prohibiting application data.
Confirm that interpretation with the team/sponsor.

Before internet deployment: use HTTPS; separate migration/application DB roles
with least privilege; configure database TLS and backups; protect OS filesystem
credentials with appropriate ACLs; use a shared rate-limit store for multiple
server instances; configure trusted proxy hops deliberately; add email ownership
verification and account recovery; add shared session cleanup/retention policy,
moderation, logging/monitoring, upload malware/type/size validation, safe media
storage, and end-to-end access controls. Rate limiting currently uses per-process
memory (30 auth requests per 15 minutes and 240 general requests per minute per
IP); it is a local foundation, not distributed abuse prevention.

The two supplied diagrams remain the team's original design artifacts. This
schema intentionally extends them where the requirements require more data;
update the diagrams alongside future implementation decisions.
