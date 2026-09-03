# Phase 2 — Code Swap Guide

When the VPS is ready and data is imported, replace the internals of these files.
**API routes, pages, and components do NOT change.**

---

## Step 1 — Install packages

```bash
npm install pg @types/pg bcryptjs @types/bcryptjs
npm uninstall @supabase/supabase-js @supabase/ssr @auth/supabase-adapter
```

---

## Step 2 — Activate pool.ts

Uncomment everything in `src/lib/db/pool.ts`. Set `DATABASE_URL` in Vercel.

---

## Step 3 — Swap src/lib/db/categories.ts

Replace the header and imports:

```typescript
// Remove ALL Supabase imports, replace with:
import pool from "@/lib/db/pool";
import type { Category } from "@/types/product";

export async function getCategories(withActiveProductsOnly = false): Promise<Category[]> {
  if (withActiveProductsOnly) {
    const { rows } = await pool.query<Category>(`
      SELECT DISTINCT c.id, c.name, c.slug, c.image_url, c.description, c.created_at
      FROM categories c
      JOIN products p ON p.category_id = c.id AND p.status = 'active'
      ORDER BY c.name
    `);
    return rows;
  }
  const { rows } = await pool.query<Category>(
    `SELECT * FROM categories ORDER BY name`
  );
  return rows;
}

export async function getAvailableCategories(): Promise<Category[]> {
  return getCategories(true);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { rows } = await pool.query<Category>(
    `SELECT * FROM categories WHERE slug = $1`,
    [slug]
  );
  return rows[0] ?? null;
}

export async function getCategoryByName(name: string): Promise<Category | null> {
  const { rows } = await pool.query<Category>(
    `SELECT id, name FROM categories WHERE lower(name) = lower($1) LIMIT 1`,
    [name.trim()]
  );
  return rows[0] ?? null;
}

export async function createCategory(payload: {
  name: string; slug: string; description?: string | null; image_url?: string | null;
}): Promise<Category> {
  const { rows } = await pool.query<Category>(
    `INSERT INTO categories(name, slug, description, image_url)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [payload.name, payload.slug, payload.description ?? null, payload.image_url ?? null]
  );
  return rows[0];
}

export async function countProductsInCategory(id: string): Promise<number> {
  const { rows } = await pool.query<{ count: string }>(
    `SELECT COUNT(*) FROM products WHERE category_id = $1`,
    [id]
  );
  return parseInt(rows[0].count, 10);
}

export async function deleteCategory(id: string): Promise<void> {
  await pool.query(`DELETE FROM categories WHERE id = $1`, [id]);
}
```

Apply the same pattern for `reviews.ts`, `addresses.ts`, `products.ts`, `orders.ts`, `users.ts`:
- Replace `supabase.from('table')` queries with `pool.query('SELECT ...')`
- Keep the same function names and return types

---

## Step 4 — Swap src/lib/auth/user-service.ts

```typescript
import pool from "@/lib/db/pool";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { AuthUserResult } from "@/lib/auth/user-service";

export async function verifyPassword(email: string, password: string): Promise<AuthUserResult | null> {
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.password_hash, u.name, u.image, p.status
     FROM users u JOIN profiles p ON p.id = u.id
     WHERE u.email = $1`,
    [email.toLowerCase().trim()]
  );
  const user = rows[0];
  if (!user || !user.password_hash) return null;
  if (user.status === 'inactive') return null;
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return null;
  return { id: user.id, email: user.email, name: user.name, image: user.image };
}

export async function createAuthUser(email: string, password: string, meta?: { name?: string }): Promise<string> {
  const hash = password ? await bcrypt.hash(password, 12) : null;
  const { rows } = await pool.query(
    `INSERT INTO users(email, password_hash, name) VALUES($1, $2, $3) RETURNING id`,
    [email.toLowerCase().trim(), hash, meta?.name ?? null]
  );
  return rows[0].id as string;
}

export async function deleteAuthUser(userId: string): Promise<void> {
  await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
}

export async function updateAuthPassword(userId: string, newPassword: string): Promise<void> {
  const hash = await bcrypt.hash(newPassword, 12);
  await pool.query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [hash, userId]);
}

export async function isGoogleOnlyUser(userId: string): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT password_hash FROM users WHERE id = $1`,
    [userId]
  );
  return rows.length > 0 && rows[0].password_hash === null;
}

export async function upsertGoogleAuthUser(email: string, meta?: { name?: string | null; avatar_url?: string | null }): Promise<string | null> {
  const { rows } = await pool.query(
    `INSERT INTO users(email, password_hash, name, image)
     VALUES ($1, NULL, $2, $3)
     ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
     RETURNING id`,
    [email.toLowerCase().trim(), meta?.name ?? null, meta?.avatar_url ?? null]
  );
  return rows[0]?.id ?? null;
}

export async function updateAuthMeta(userId: string, meta: { name?: string }): Promise<void> {
  if (!meta.name) return;
  await pool.query(`UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2`, [meta.name, userId]);
}
```

---

## Step 5 — Swap src/lib/db/password-reset-tokens.ts

```typescript
import pool from "@/lib/db/pool";
// Replace all createAdminClient() calls with pool.query()

export async function createResetToken(userId: string, token: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  await pool.query(
    `INSERT INTO password_reset_tokens(user_id, token, expires_at) VALUES($1, $2, $3)`,
    [userId, token, expiresAt]
  );
}

export async function findValidResetToken(token: string): Promise<ResetToken | null> {
  const { rows } = await pool.query(
    `SELECT * FROM password_reset_tokens
     WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()`,
    [token]
  );
  return rows[0] ?? null;
}

export async function markTokenUsed(token: string): Promise<void> {
  await pool.query(
    `UPDATE password_reset_tokens SET used_at = NOW() WHERE token = $1`,
    [token]
  );
}
```

---

## Step 6 — Remove Supabase env vars, add DATABASE_URL

In Vercel Production → Environment Variables:
- DELETE: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_PASSWORD`
- ADD: `DATABASE_URL=postgresql://gifwoods_app:PWD@VPS_IP:6432/gifwoods?sslmode=require`

---

## Step 7 — Delete src/lib/supabase/ folder

After verifying the app works on VPS:
```bash
rm -rf src/lib/supabase/
```

Then update `next.config.ts` to remove `*.supabase.co` from `remotePatterns`.
