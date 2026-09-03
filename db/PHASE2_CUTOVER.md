# Phase 2 — Cutover & Cleanup Guide

Follow these steps only after data is imported to VPS and verified (broken_count = 0).

---

## Pre-cutover: Staging Smoke Test

1. In Vercel → **Preview branch** environment variables, set:
   ```
   DATABASE_URL=postgresql://gifwoods_app:PWD@VPS_IP:6432/gifwoods_test?sslmode=require
   ```
2. Deploy a preview build.
3. Checklist:
   - [ ] Login with existing email + same password → **must work** (same bcrypt hash)
   - [ ] Login with Google → **must work**
   - [ ] My Orders page → existing order history loads
   - [ ] Admin panel: products, orders, users all load
   - [ ] Create a test order end-to-end (checkout → payment → order created)
   - [ ] Password reset flow → receive email, reset, login with new password
   - [ ] Admin: create user, update user, delete user
   - [ ] Admin: create category, add product, delete product

---

## Production Cutover (Zero Downtime)

1. **Keep Supabase running** (do NOT delete it — rollback source for 48h)

2. In Vercel → **Production** environment variables:
   - **REMOVE**: `NEXT_PUBLIC_SUPABASE_URL`
   - **REMOVE**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **REMOVE**: `SUPABASE_SERVICE_ROLE_KEY`
   - **REMOVE**: `SUPABASE_DB_PASSWORD`
   - **ADD**: `DATABASE_URL=postgresql://gifwoods_app:PWD@VPS_IP:6432/gifwoods?sslmode=require`

3. `git push` → Vercel redeploys automatically

4. Monitor Vercel logs for errors for **48 hours**

---

## Rollback (if anything breaks in 48h window)

1. In Vercel → Production env vars:
   - Remove `DATABASE_URL`
   - Re-add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
2. `git push` → back on Supabase in ~2 minutes

---

## Cleanup (after 48h stable)

```bash
# Remove Supabase packages
npm uninstall @supabase/supabase-js @supabase/ssr @auth/supabase-adapter supabase

# Remove src/lib/supabase/ folder (all replaced by src/lib/db/)
rm -rf src/lib/supabase/

# Archive supabase/ SQL folder (keep migrations history)
mv supabase/ supabase_archived/
```

Update `next.config.ts` remotePatterns — remove:
```ts
{ protocol: "https", hostname: "*.supabase.co" },
```

Remove from `package.json` scripts:
- `db:login`, `db:link`, `db:push`, `db:pull`, `db:reset`, `db:status`

---

## Summary: What changed on migration day

| File / Config | Before | After |
|---|---|---|
| `src/lib/db/*.ts` | Supabase PostgREST | `pool.query()` |
| `src/lib/auth/user-service.ts` | Supabase Auth Admin | `bcryptjs + pool` |
| Vercel env vars | Supabase keys | `DATABASE_URL` |
| API routes, pages, components | *(unchanged)* | *(unchanged)* |
| User passwords | bcrypt hash in Supabase | Same bcrypt hash in VPS |
| Existing orders / products | *(unchanged)* | *(unchanged)* |
