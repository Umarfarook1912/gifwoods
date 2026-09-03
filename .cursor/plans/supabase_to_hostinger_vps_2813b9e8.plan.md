---
name: Supabase to Hostinger VPS
overview: |
  Two-phase plan: Phase 1 (DO NOW) — refactor code into a DB abstraction layer while still on Supabase, so migration day only requires swapping internals. Phase 2 (DO LATER) — VPS setup, data export/import, cutover. All existing user logins, orders, and products work without data loss or password resets.
todos:
  - id: now-db-services
    content: "PHASE 1 — NOW: Create src/lib/db/ service modules (products, orders, categories, reviews, addresses, users) that wrap Supabase internally. API routes import from here instead of calling Supabase directly."
    status: completed
  - id: now-auth-service
    content: "PHASE 1 — NOW: Create src/lib/auth/user-service.ts that wraps all Supabase Auth Admin API calls (signInWithPassword, createUser, deleteUser, generateLink, etc). auth.ts and API routes import from here."
    status: completed
  - id: now-reset-password
    content: "PHASE 1 — NOW: Refactor forgot-password/reset-password flow to use a self-managed token table (password_reset_tokens) + Brevo email instead of Supabase generateLink — works on Supabase today AND on VPS later."
    status: completed
  - id: later-vps-setup
    content: "PHASE 2 — LATER: Install PostgreSQL 16 on Hostinger VPS, create gifwoods/gifwoods_test DBs, SSL, PgBouncer, nightly pg_dump backup"
    status: completed
  - id: later-schema
    content: "PHASE 2 — LATER: Write plain-Postgres schema (db/migrations/) — new users table replacing auth.users, profiles FK update, no RLS"
    status: completed
  - id: later-swap-internals
    content: "PHASE 2 — LATER: Swap src/lib/db/ and src/lib/auth/user-service.ts internals from Supabase to pg pool + bcryptjs. API routes untouched."
    status: completed
  - id: later-data-export
    content: "PHASE 2 — LATER: Export Supabase data (pg_dump all tables + auth.users password hashes), run transform script, import to VPS"
    status: completed
  - id: later-cutover
    content: "PHASE 2 — LATER: Staging smoke test → production cutover (swap DATABASE_URL in Vercel) → 48h rollback window → cleanup Supabase packages/vars"
    status: completed
isProject: false
---

# Supabase → Hostinger VPS: Full Migration Plan

---

## Your 4 Questions — Answered First

### Q1: After Phase 1 code changes, will existing users/admins need to re-login or create new accounts?

**No. Zero impact on any user.** Phase 1 is purely internal refactoring. The app still runs on Supabase. From a user's perspective absolutely nothing changes:

- Sessions stay alive (NextAuth JWT cookies are not touched)
- No re-login required
- No new account needed
- Admin panel works identically
- All data stays in Supabase throughout Phase 1

The only sub-change that affects behavior is the forgot-password flow. Currently it uses a Supabase magic link. After Phase 1 it uses our own token + Brevo email. This only affects users who are mid-password-reset at the exact moment of deployment — active logged-in sessions are completely unaffected.

---

### Q2: Do products, reviews, categories, and other sections need code changes?

**For Phase 1 (abstraction layer):** Yes, their API route files are touched — but only to change the `import` line at the top. The behavior, data, and API response format stay 100% identical. Users never notice.

**For Phase 2 (actual migration / data):** The `products`, `categories`, `reviews`, `orders`, `order_items`, `addresses` tables are plain PostgreSQL tables with no Supabase-specific features. Export → import → they work exactly the same on VPS. No schema changes needed for any of these tables.

---

### Q3: After Phase 1, is migration just "deploy + change DATABASE_URL + export/import from Supabase"?

**Almost — but not zero code changes.** After Phase 1, migration day requires:

| Task                                                                      | Effort   |
| ------------------------------------------------------------------------- | -------- |
| Swap `src/lib/db/` internals (7 files) from Supabase to `pg`              | ~1 hour  |
| Swap `src/lib/auth/user-service.ts` from Supabase Auth to `bcryptjs + pg` | ~30 min  |
| Add `pg` + `bcryptjs` to `package.json`                                   | 2 mins   |
| Export data from Supabase (one command)                                   | ~10 mins |
| Import data to VPS (one command)                                          | ~10 mins |
| Remove Supabase env vars, add `DATABASE_URL` in Vercel                    | 5 mins   |
| `git push` → Vercel redeploys                                             | ~5 mins  |

So migration day = ~2 hours of focused work. No API routes, no pages, no components change. Only the internal implementations of `lib/db/` and `user-service.ts` swap — same function names, same signatures, same return types — just `pool.query()` instead of `supabase.from()`.

---

### Q4: Will there be any existing data loss during migration?

**No data loss, if the import order is followed correctly.**

- Every table (`profiles`, `products`, `categories`, `orders`, `order_items`, `reviews`, `addresses`) is exported via `pg_dump`
- `auth.users` password hashes are exported separately via a SQL query
- Same UUIDs are preserved → every foreign key relationship is intact after import
- A verification query before cutover confirms zero broken references
- Supabase stays live for 48 hours post-cutover as rollback — if anything is wrong, revert the Vercel env vars and you're back to Supabase instantly

---

## The Core Question: Will Existing User Logins Work After Migration?

**YES — 100% same account, same password, no reset needed.** Here is exactly why:

```mermaid
flowchart LR
  subgraph supabase [Supabase Today]
    SB_AUTH["auth.users table\nid: abc-123\nemail: user@gmail.com\nencrypted_password: dollar2a10xyz..."]
  end
  subgraph vps [VPS After Migration]
    VPS_USERS["users table\nid: abc-123 SAME UUID\nemail: user@gmail.com\npassword_hash: dollar2a10xyz... SAME HASH"]
  end
  subgraph login [Login Check]
    CHECK["bcryptjs.compare(userPassword, hash) TRUE same account same password"]
  end
  supabase -->|"export + copy hash directly"| vps
  vps --> login
```

- Supabase stores passwords as **bcrypt hashes** in `auth.users.encrypted_password`
- bcrypt is a universal standard — Node's `bcryptjs` reads it natively
- Export hash → import into `users.password_hash` → `bcryptjs.compare()` works
- **Same UUID preserved** → all orders, reviews, addresses linked to that UUID are intact
- **Google users**: login via Google OAuth by email → same account, no password needed
- **Result**: zero forced password resets, zero lost order history

---

## Strategy: Do NOW vs Do LATER

The problem with migrating without preparation: you would need to touch 22+ API routes, 3 lib files, auth.ts, and 2 components — all at the same time, under pressure.

The smart approach is to **isolate all Supabase calls into service modules NOW** while the app is still on Supabase and there's no pressure. Then migration day only swaps the internals of those modules.

```mermaid
flowchart TD
  subgraph NOW [Phase 1 — Do NOW while on Supabase]
    N1[Create src/lib/db/ service modules]
    N2[Create src/lib/auth/user-service.ts]
    N3[Refactor reset-password to self-managed tokens]
    N4[API routes import from lib/db/ only]
    N1 --> N4
    N2 --> N4
    N3 --> N4
  end
  subgraph LIVE [App goes live grows traffic increases]
    L1[Product launched on Supabase]
  end
  subgraph LATER [Phase 2 — Do LATER when needed]
    B1[VPS Setup and Schema]
    B2[Export Supabase data]
    B3[Swap lib/db/ internals to pg]
    B4[Swap user-service.ts to bcryptjs plus pg]
    B5[Import data and cutover]
    B1 --> B2 --> B3 --> B4 --> B5
  end
  NOW --> LIVE --> LATER
```

**Phase 1 result**: API routes, pages, components are untouched on migration day.
**Phase 2 result**: Only `src/lib/db/` files and `user-service.ts` change. Everything else stays.

---

## PHASE 1 — DO NOW (Migration-Ready Refactor)

App stays fully on Supabase. No user-facing changes. Internal code structure only.

---

### US-1: As a developer, I need all DB calls isolated in service modules

**Create `src/lib/db/` with 6 service files.** Each wraps Supabase today, swapped to `pg` on migration day. Function signatures stay identical — callers don't care what's inside.

#### `src/lib/db/products.ts` (new)

Moves inline Supabase calls out of [`src/app/api/products/route.ts`](src/app/api/products/route.ts) and [`src/app/api/products/[id]/route.ts`](src/app/api/products/[id]/route.ts):

```typescript
// TODAY: internally calls createClient() from supabase/server
// LATER: swap to pool.query() — callers don't change
export async function getProducts(
  filters: ProductFilters,
): Promise<PaginatedResponse<Product>>;
export async function getProductById(id: string): Promise<Product | null>;
export async function createProduct(data: ProductFormData): Promise<Product>;
export async function updateProduct(
  id: string,
  data: Partial<ProductFormData>,
): Promise<Product>;
export async function deleteProduct(id: string): Promise<void>;
```

#### `src/lib/db/orders.ts` (new)

Moves Supabase calls out of all 6 order API routes:

```typescript
export async function getOrders(
  userId: string,
  filters,
): Promise<PaginatedResponse<Order>>;
export async function getAllOrders(filters): Promise<PaginatedResponse<Order>>; // admin
export async function getOrderById(id: string): Promise<Order | null>;
export async function createOrder(data): Promise<Order>;
export async function updateOrder(
  id: string,
  data: Partial<Order>,
): Promise<Order>;
```

#### `src/lib/db/categories.ts` (new)

Moves calls from routes + replaces [`src/lib/supabase/categories-db.ts`](src/lib/supabase/categories-db.ts):

```typescript
export async function getCategories(): Promise<Category[]>;
export async function getCategoryBySlug(slug: string): Promise<Category | null>;
export async function createCategory(data): Promise<Category>;
export async function deleteCategory(id: string): Promise<void>;
```

#### `src/lib/db/reviews.ts` (new)

Replaces [`src/lib/supabase/reviews-db.ts`](src/lib/supabase/reviews-db.ts) — same function signatures, new path.

#### `src/lib/db/addresses.ts` (new)

Replaces [`src/lib/supabase/profile-db.ts`](src/lib/supabase/profile-db.ts) — same function signatures, new path. All 4 address functions (`getAddresses`, `createAddress`, `updateAddress`, `deleteAddress`) moved here.

#### `src/lib/db/users.ts` (new)

Extracts user DB queries from [`src/lib/auth/auth.ts`](src/lib/auth/auth.ts), [`src/lib/admin/dashboard-stats.ts`](src/lib/admin/dashboard-stats.ts), and admin routes:

```typescript
export async function getUserByEmail(
  email: string,
): Promise<UserProfile | null>;
export async function getUserById(id: string): Promise<UserProfile | null>;
export async function createUserProfile(data): Promise<UserProfile>;
export async function updateUserProfile(id: string, data): Promise<UserProfile>;
export async function deleteUserProfile(id: string): Promise<void>;
export async function getAllUsers(
  filters,
): Promise<PaginatedResponse<UserProfile>>;
```

**All 22+ API routes updated to import from `src/lib/db/` instead of importing `createClient` from `@/lib/supabase/server`.**

---

### US-2: As a developer, I need all Supabase Auth Admin API calls in one place

**Create [`src/lib/auth/user-service.ts`](src/lib/auth/user-service.ts)** — wraps every Supabase Auth Admin call. The files that currently call Supabase Auth directly are updated to call this service instead.

```typescript
// Every function today calls Supabase internally.
// On migration day, swap to bcryptjs + pg — callers never change.

export async function verifyPassword(
  email: string,
  password: string,
): Promise<AuthUser | null>;
// TODAY: supabase.auth.signInWithPassword(email, password)
// LATER: SELECT from users WHERE email=$1 → bcryptjs.compare(password, hash)

export async function createAuthUser(
  email: string,
  password?: string,
  meta?,
): Promise<string>;
// TODAY: supabase.auth.admin.createUser(...)
// LATER: INSERT INTO users(id, email, password_hash) with bcryptjs.hash(password)

export async function deleteAuthUser(userId: string): Promise<void>;
// TODAY: supabase.auth.admin.deleteUser(userId)
// LATER: DELETE FROM users WHERE id = $1

export async function updateAuthPassword(
  userId: string,
  newPassword: string,
): Promise<void>;
// TODAY: supabase.auth.admin.updateUserById(userId, { password })
// LATER: UPDATE users SET password_hash = bcryptjs.hash(newPassword) WHERE id = $1

export async function isGoogleOnlyUser(userId: string): Promise<boolean>;
// TODAY: supabase.auth.admin.getUserById → check identities
// LATER: SELECT password_hash FROM users WHERE id = $1 → NULL means Google-only

export async function upsertGoogleUser(email: string, meta): Promise<string>;
// TODAY: supabase.auth.admin.createUser + generateLink fallback (current auth.ts Google flow)
// LATER: INSERT INTO users(email, password_hash=NULL) ON CONFLICT DO NOTHING
```

**Files updated to import from `user-service.ts` instead of Supabase directly:**

- [`src/lib/auth/auth.ts`](src/lib/auth/auth.ts) — Credentials `authorize`, Google `signIn` callback, JWT `callback`
- [`src/app/api/auth/register/route.ts`](src/app/api/auth/register/route.ts)
- [`src/app/api/admin/users/route.ts`](src/app/api/admin/users/route.ts)
- [`src/app/api/admin/users/[id]/route.ts`](src/app/api/admin/users/[id]/route.ts)
- [`src/app/api/profile/security/route.ts`](src/app/api/profile/security/route.ts)

---

### US-3: As a developer, I need the forgot/reset-password flow to work without Supabase magic links

Currently [`src/app/api/auth/forgot-password/route.ts`](src/app/api/auth/forgot-password/route.ts) calls `supabase.auth.admin.generateLink()` which creates a Supabase-hosted recovery URL. This **cannot work on VPS**. Fix this NOW (while still on Supabase) so it works on both.

**Add `password_reset_tokens` table to Supabase migrations now (and to `db/migrations/` later):**

```sql
CREATE TABLE password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);
```

**New flow (works on Supabase today, works on VPS later):**

1. `POST /api/auth/forgot-password` → `crypto.randomBytes(32)` token → store in `password_reset_tokens` (expires in 1h) → send link via Brevo (already integrated)
2. `GET /api/auth/verify-reset-token?token=xxx` (new route) → check token exists, not expired, not used
3. `POST /api/auth/reset-password` (new route) → validate token → call `user-service.updateAuthPassword()` → mark token `used_at`

**Components updated:**

- [`src/hooks/usePasswordRecoveryLink.ts`](src/hooks/usePasswordRecoveryLink.ts) — remove all `supabase.auth.getUser/setSession/onAuthStateChange`. Replace with a simple `fetch('/api/auth/verify-reset-token?token=...')`
- [`src/components/features/auth/reset-password/ResetPasswordForm.tsx`](src/components/features/auth/reset-password/ResetPasswordForm.tsx) — remove `supabase.auth.updateUser({ password })`. Replace with `POST /api/auth/reset-password`

---

### Phase 1 — Full File Change List

| File                           | What Changes                                               |
| ------------------------------ | ---------------------------------------------------------- |
| `src/lib/db/products.ts`       | New — wraps Supabase product queries                       |
| `src/lib/db/orders.ts`         | New — wraps Supabase order queries                         |
| `src/lib/db/categories.ts`     | New — replaces `supabase/categories-db.ts`                 |
| `src/lib/db/reviews.ts`        | New — replaces `supabase/reviews-db.ts`                    |
| `src/lib/db/addresses.ts`      | New — replaces `supabase/profile-db.ts`                    |
| `src/lib/db/users.ts`          | New — user profile DB operations                           |
| `src/lib/auth/user-service.ts` | New — wraps all Supabase Auth Admin calls                  |
| `src/lib/auth/auth.ts`         | Update: import from `user-service.ts` + `users.ts`         |
| All 22+ API routes             | Update: import from `lib/db/` instead of `supabase/server` |
| `api/auth/forgot-password`     | Refactor: use self-managed token table + Brevo             |
| `api/auth/reset-password`      | New route: token validation + password update              |
| `api/auth/verify-reset-token`  | New route: token validity check for UI                     |
| `usePasswordRecoveryLink.ts`   | Remove all Supabase client Auth calls                      |
| `ResetPasswordForm.tsx`        | Remove `supabase.auth.updateUser()`                        |

**What does NOT change at all:** Pages, components (except ResetPasswordForm), types, constants, TanStack Query hooks, cart, checkout UI, Zustand stores.

---

## PHASE 2 — DO LATER (Actual Migration, When Traffic Demands It)

At this point, all Supabase calls are already isolated. Migration day is just swapping internals + moving data.

---

### US-4: As a developer, I need PostgreSQL on Hostinger VPS

- Install PostgreSQL 16 on VPS
- Create: `gifwoods` (production) and `gifwoods_test` (staging)
- Create roles: `gifwoods_app` (CRUD only) and `gifwoods_admin` (DDL)
- SSL on port 5432; firewall: Vercel IP ranges + your static IP only
- **PgBouncer (transaction mode)** — mandatory for Vercel serverless; without it, Postgres `max_connections` will be exhausted by serverless cold starts
- Nightly `pg_dump` cron → local disk + Hostinger object storage

---

### US-5: As a developer, I need a plain Postgres schema (no Supabase schemas/extensions)

New `db/migrations/` folder. Key change: add `users` table, update `profiles` FK.

```sql
-- New table replaces auth.users
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,   -- NULL for Google-only users
  name TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- profiles.id FK updated to reference users instead of auth.users
ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;
```

All other tables (`categories`, `products`, `orders`, `order_items`, `reviews`, `addresses`, `password_reset_tokens`) have identical columns — copy as-is from existing migrations.

Strip all Supabase RLS policies — app already uses service role which bypasses RLS anyway.

---

### US-6: As a developer, I need to swap `src/lib/db/` and `user-service.ts` internals to use pg

Because Phase 1 isolated all Supabase calls, **this is the only code change on migration day:**

Add `src/lib/db/pool.ts`:

```typescript
import { Pool } from "pg";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true },
});
export default pool;
```

Then swap each module's internals:

- `src/lib/db/products.ts` → replace `supabase.from('products').select(...)` with `pool.query('SELECT ... FROM products WHERE ...')`
- Same pattern for orders, categories, reviews, addresses, users
- `src/lib/auth/user-service.ts` → replace all `supabase.auth.admin.*` with `pool.query()` + `bcryptjs`

Add `bcryptjs` to `package.json`.

**Zero changes to API routes, pages, or components.**

---

### US-7: As a business owner, all existing users/orders/products migrate with zero data loss

#### Step 1 — Export from Supabase

```bash
# Export all business tables
pg_dump "postgresql://postgres:SUPABASE_DB_PASSWORD@db.vtjitcdljzzcyqvihcki.supabase.co:5432/postgres" \
  --table=public.profiles \
  --table=public.categories \
  --table=public.products \
  --table=public.orders \
  --table=public.order_items \
  --table=public.reviews \
  --table=public.addresses \
  --table=public.password_reset_tokens \
  --data-only --no-owner > gifwoods_data.sql

# Export auth.users separately — password hashes live here
psql "postgresql://postgres:SUPABASE_DB_PASSWORD@db.vtjitcdljzzcyqvihcki.supabase.co:5432/postgres" \
  -c "COPY (
    SELECT id, email, encrypted_password,
           raw_user_meta_data->>'name' as name,
           raw_user_meta_data->>'avatar_url' as image,
           created_at
    FROM auth.users
  ) TO STDOUT WITH CSV HEADER" > auth_users.csv
```

#### Step 2 — Transform auth data (one-time script)

```sql
-- encrypted_password from Supabase IS bcrypt format ($2a$10$...)
-- bcryptjs.compare() reads it natively — no re-hashing needed
COPY users(id, email, password_hash, name, image, created_at)
FROM '/path/to/auth_users.csv'
WITH (FORMAT csv, HEADER true, NULL '');
-- Google-only users have empty encrypted_password → becomes NULL → works correctly
```

#### Step 3 — Import to VPS (FK order matters)

1. Run `db/migrations/` schema SQL
2. Import `users` (no FK dependencies)
3. Import `profiles` (FK → users)
4. Import `categories` (no FK dependencies)
5. Import `products` (FK → categories)
6. Import `orders` (FK → profiles)
7. Import `order_items` (FK → orders + products)
8. Import `reviews` (FK → profiles + products)
9. Import `addresses` (FK → profiles)
10. Import `password_reset_tokens` (FK → profiles)

Verify integrity: `SELECT COUNT(*) FROM profiles p LEFT JOIN users u ON u.id = p.id WHERE u.id IS NULL;` → must return 0.

#### Step 4 — Staging smoke test (before touching production)

- Set Vercel Preview Branch env: `DATABASE_URL` → VPS `gifwoods_test` DB
- Checklist:
  - Login with existing email + same password → must work (same bcrypt hash)
  - Google login → must work
  - Orders page loads with existing order history
  - Admin panel: products, orders, users all load
  - Create a test order end-to-end
  - Password reset flow → receive email, reset, login with new password

#### Step 5 — Production cutover (zero downtime)

- Keep Supabase on (read-only mentally) as rollback for 48 hours
- In Vercel Production environment:
  - Remove: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_PASSWORD`
  - Add: `DATABASE_URL=postgresql://gifwoods_app:PWD@VPS_IP:6432/gifwoods?sslmode=require`
- `git push` → Vercel redeploys → new code hits VPS DB
- Monitor error logs for 48 hours; rollback = revert 4 Vercel env vars

---

### US-8: As a developer, I need Supabase fully removed after successful migration

- Delete `src/lib/supabase/` folder (6 files — all replaced by `src/lib/db/`)
- Remove packages: `@supabase/supabase-js`, `@supabase/ssr`, `@auth/supabase-adapter`, `supabase` CLI
- Remove `package.json` DB scripts: `db:login`, `db:link`, `db:push`, `db:pull`, `db:reset`, `db:status`
- Archive (do not delete) `supabase/` folder — keep SQL history
- Update `next.config.ts` `remotePatterns`: remove `*.supabase.co`

---

## Summary: What Changes NOW vs LATER

```mermaid
flowchart LR
  subgraph now [Phase 1 NOW while on Supabase]
    N1["src/lib/db/ modules\nwrap Supabase internally"]
    N2["src/lib/auth/user-service.ts\nwraps Auth Admin calls"]
    N3["forgot+reset-password\nself-managed tokens"]
    N4["API routes updated\nto import from lib/db/"]
  end
  subgraph live [App live on Supabase traffic grows]
    L1[Users orders products growing]
  end
  subgraph later [Phase 2 LATER when needed]
    L2[VPS Setup and Schema]
    L3["Export data\npassword hashes included"]
    L4["Swap lib/db/ internals\nto pg pool"]
    L5["Swap user-service.ts\nto bcryptjs plus pg"]
    L6["Change Vercel env vars\nDATABASE_URL only"]
    L7["Same accounts\nSame passwords\nAll history intact"]
    L2 --> L3 --> L4 --> L5 --> L6 --> L7
  end
  now --> live --> later
```

---

## Environment Variable Changes (Phase 2 only)

| Action     | Variable                                                                          |
| ---------- | --------------------------------------------------------------------------------- |
| **Remove** | `NEXT_PUBLIC_SUPABASE_URL`                                                        |
| **Remove** | `NEXT_PUBLIC_SUPABASE_ANON_KEY`                                                   |
| **Remove** | `SUPABASE_SERVICE_ROLE_KEY`                                                       |
| **Remove** | `SUPABASE_DB_PASSWORD`                                                            |
| **Add**    | `DATABASE_URL=postgresql://gifwoods_app:PWD@VPS_IP:6432/gifwoods?sslmode=require` |

All other vars (NextAuth, Cashfree, Brevo, Shiprocket, GA) unchanged in both phases.

---

## Risk Notes

- **Latency:** Pick Hostinger VPS region closest to your Vercel deployment region (e.g., `sin1` → Singapore VPS if using Vercel Asia)
- **Connections:** PgBouncer is non-optional for Vercel serverless
- **Password migration:** Supabase bcrypt hashes are 100% compatible — no password resets needed
- **Rollback:** Keep Supabase running for 48h after cutover; instant rollback = revert Vercel env vars
- **Shared VPS:** Isolate DB user/resources if other projects share the same Hostinger KVM
