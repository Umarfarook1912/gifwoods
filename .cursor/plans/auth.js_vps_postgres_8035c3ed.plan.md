---
name: Auth.js VPS Postgres
overview: Migrate Gifwoods off Supabase to Auth.js (NextAuth) with passwords in Postgres, and run PostgreSQL on your VPS. Next.js stays on Vercel; use DBeaver for a local/test DB while developing.
todos:
  - id: vps-postgres-setup
    content: Install Postgres on VPS, create gifwoods + gifwoods_test DBs, SSL, firewall, optional PgBouncer
    status: pending
  - id: sql-schema
    content: "Write plain-Postgres migrations: users table, profiles FK to users, drop auth.users/RLS"
    status: pending
  - id: db-pool-layer
    content: Add pg Pool helper and replace supabase-js queries across API/RSC
    status: pending
  - id: authjs-passwords
    content: Rewire Auth.js Credentials/Google/register/admin to users+bcrypt (no Supabase Auth)
    status: pending
  - id: dbeaver-local
    content: Document DBeaver test DB + DATABASE_URL for local Next.js
    status: pending
  - id: data-cutover
    content: Export Supabase data, import to VPS, migrate/reset passwords, switch Vercel env
    status: pending
isProject: false
---

# Auth.js + VPS Postgres migration

## Target stack (matches your diagram)

```mermaid
flowchart TB
  users[Users_Browsers]
  vercel[Vercel]
  nextjs[Nextjs_Frontend_and_API]
  authjs[Authjs_JWT_sessions]
  vps[VPS]
  postgres[PostgreSQL]
  dbeaver[DBeaver_dev_admin]

  users --> vercel
  vercel --> nextjs
  nextjs --> authjs
  nextjs -->|"DATABASE_URL SSL"| postgres
  vps --> postgres
  dbeaver -->|"SQL schema and test data"| postgres
```

| Layer                     | What runs where                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------- |
| Frontend + API routes     | **Next.js on Vercel** (unchanged host)                                                  |
| Sessions / login / Google | **Auth.js** (`next-auth` v5 you already use) inside Next.js                             |
| Database                  | **PostgreSQL on VPS** (not Supabase)                                                    |
| Schema / seed / inspect   | **DBeaver** against VPS (or a local Postgres for test)                                  |
| Files / images            | Keep current upload path for now; move to object storage later (Vercel FS is ephemeral) |

**Chosen defaults:** keep Auth.js (not Better Auth); use the existing `pg` package with a small pool helper (no Drizzle unless you want it later); drop Supabase Auth, RLS, and `supabase-js`.

---

## How the stack works after migration

1. Browser hits Vercel (pages + `/api/*`).
2. Auth.js issues a **JWT session cookie** (same as today).
3. Credentials login: Auth.js `authorize` reads `users` + `profiles` via `pg`, verifies **bcrypt** password — no `supabase.auth.signInWithPassword`.
4. Google login: Auth.js Google provider; app creates/links a row in `users` + `profiles` by email — no `auth.admin.createUser`.
5. All product/order/admin queries use `DATABASE_URL` → VPS Postgres over SSL.

---

## Database shape

### Today (Supabase)

- `profiles.id` → `auth.users(id)` (Supabase-managed)
- App data: `categories`, `products`, `orders`, `reviews`, etc.
- RLS policies exist but runtime uses **service role** (bypasses RLS)

### After (plain Postgres)

```mermaid
erDiagram
  users ||--|| profiles : "id"
  profiles ||--o{ orders : user_id
  profiles ||--o{ addresses : user_id
  profiles ||--o{ reviews : user_id
  categories ||--o{ products : category_id
  products ||--o{ order_items : product_id
  orders ||--o{ order_items : order_id

  users {
    uuid id PK
    text email UK
    text password_hash
    text name
    text image
    timestamptz created_at
  }
  profiles {
    uuid id PK
    text email UK
    text role
    text status
    jsonb permissions
  }
```

- New **`users`** table owns identity + `password_hash` (nullable for Google-only).
- **`profiles.id`** FK → `users(id)` instead of `auth.users`.
- Keep existing business tables; strip `REFERENCES auth.users` and Supabase-only RLS/`auth.uid()` policies.
- Ship a clean SQL dump under something like [`db/migrations/`](db/migrations/) (DBeaver-friendly). Reuse logic from [`supabase/migrations/`](supabase/migrations/) without Supabase schemas.

Session field rename (small cleanup): `session.user.supabaseId` → `session.user.profileId` (or keep name temporarily to reduce churn).

---

## Deployment picture

### VPS (Postgres)

1. Install PostgreSQL 16 on the VPS (dedicated DB user + database `gifwoods` / `gifwoods_test`).
2. Enable SSL; open port **5432** only to trusted IPs (or SSH tunnel for DBeaver; prefer allowlisting rather than `0.0.0.0` open).
3. Create roles: app user (CRUD) vs admin (migrations).
4. Optional but recommended for Vercel: **PgBouncer** (transaction mode) — serverless opens many short connections.
5. Nightly backups (`pg_dump` cron) to disk/object storage.

### DBeaver (your workflow)

1. Connect to VPS `gifwoods_test` (or local Postgres).
2. Run migration SQL scripts.
3. Insert seed products/categories; create a test user row with a bcrypt hash for login testing.
4. Point local `.env.local` `DATABASE_URL` at that test DB while developing Next.js.

### Vercel (Next.js)

Env vars (examples):

- `DATABASE_URL=postgresql://app:...@YOUR_VPS:5432/gifwoods?sslmode=require`
- `AUTH_SECRET=...` (existing NextAuth secret)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- Remove `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, anon key

Deploy flow stays: `git push` → Vercel build → app talks to VPS DB.

---

## Code migration (what changes in the repo)

### 1. DB layer

- Add [`src/lib/db/pool.ts`](src/lib/db/pool.ts): shared `pg.Pool` from `DATABASE_URL`.
- Replace every `createClient()` / `createAdminClient()` + `.from(...)` with SQL (or thin helpers in `src/lib/db/`).
- High-touch files: [`src/lib/auth/auth.ts`](src/lib/auth/auth.ts), [`src/app/api/auth/register/route.ts`](src/app/api/auth/register/route.ts), [`src/app/api/admin/users/`](src/app/api/admin/users/), orders/products APIs, [`src/lib/admin/dashboard-stats.ts`](src/lib/admin/dashboard-stats.ts), reviews/profile DBs.
- Remove [`src/lib/supabase/`](src/lib/supabase/), `@supabase/*` deps, and Supabase npm scripts when done.

### 2. Auth.js (keep NextAuth v5)

Update [`src/lib/auth/auth.ts`](src/lib/auth/auth.ts):

- Credentials: `SELECT` from `users` + `profiles`, `bcrypt.compare`, check `profiles.status`.
- Google `signIn` callback: upsert `users` + `profiles` (no Supabase Admin API).
- JWT callback: load role/permissions from `profiles` via `pg`.

Update register + admin user CRUD to `INSERT`/`UPDATE`/`DELETE` on `users`/`profiles` with `bcrypt.hash`.

Add `bcryptjs` (or `bcrypt`) dependency.

### 3. Data cutover

1. Export schema + data from Supabase (`pg_dump` or dashboard).
2. Transform: create `users` from `auth.users`; map password hashes if exported (Supabase uses bcrypt — often migratable); else force password reset emails.
3. Import into VPS; verify FKs (`profiles`, `orders`, etc.).
4. Point staging Vercel preview at VPS test DB; smoke-test login, checkout, admin.
5. Cut production `DATABASE_URL`; keep Supabase read-only briefly as rollback.

---

## Local / test flow (as you described)

1. Create test DB in DBeaver (`gifwoods_test`).
2. Run SQL migrations + seed.
3. Run Next.js locally (`npm run dev`) with `DATABASE_URL` → test DB.
4. Frontend, API, Auth.js all stay in the same Next.js app — no separate backend service.

---

## Out of scope for this migration

- Moving Next.js off Vercel onto the VPS
- Better Auth
- Supabase Storage/Realtime (unused today)
- Production image hosting fix (still recommended soon after)

---

## Risk notes

- **Latency:** Vercel region ↔ VPS region; pick VPS close to your Vercel region if possible.
- **Connections:** without PgBouncer, serverless can exhaust Postgres `max_connections`.
- **Security:** never expose Postgres publicly without SSL + firewall; prefer SSH tunnel for DBeaver admin.
- **Shared VPS:** if another project already runs on the same KVM 2, isolate DB user/resources and watch RAM/disk.
