/**
 * Phase 2 — pg Pool (activate on migration day)
 *
 * HOW TO ACTIVATE:
 * 1. Add `pg` to package.json: npm install pg @types/pg
 * 2. Set DATABASE_URL in Vercel env vars
 * 3. Each src/lib/db/*.ts file: replace `createClient()` calls with pool queries
 * 4. Each src/lib/auth/user-service.ts: replace Supabase Auth calls with bcryptjs + pool
 *
 * This file is ready — just uncomment the export and it becomes the shared pool.
 */

// import { Pool } from "pg";
//
// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL environment variable is not set");
// }
//
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: true },
//   max: 10,                    // PgBouncer handles the real pooling; keep this low
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 5000,
// });
//
// export default pool;
