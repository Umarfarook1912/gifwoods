#!/bin/bash
# Phase 2 — Export Supabase data
# Run this script from your local machine when ready to migrate.
# Requires: SUPABASE_DB_PASSWORD and SUPABASE_DB_HOST set as env vars.
#
# Usage:
#   export SUPABASE_DB_HOST="db.vtjitcdljzzcyqvihcki.supabase.co"
#   export SUPABASE_DB_PASSWORD="your_db_password"
#   chmod +x db/scripts/export-supabase-data.sh
#   ./db/scripts/export-supabase-data.sh

set -e

DB_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@${SUPABASE_DB_HOST}:5432/postgres"
EXPORT_DIR="./db/export"
mkdir -p "$EXPORT_DIR"

echo "=== Step 1: Export all public tables (data only) ==="
pg_dump "$DB_URL" \
  --table=public.profiles \
  --table=public.categories \
  --table=public.products \
  --table=public.orders \
  --table=public.order_items \
  --table=public.reviews \
  --table=public.addresses \
  --table=public.password_reset_tokens \
  --data-only \
  --no-owner \
  --no-privileges \
  > "$EXPORT_DIR/gifwoods_data.sql"

echo "  ✓ Exported to $EXPORT_DIR/gifwoods_data.sql"

echo ""
echo "=== Step 2: Export auth.users (password hashes) ==="
psql "$DB_URL" \
  -c "COPY (
    SELECT
      id,
      email,
      NULLIF(encrypted_password, '') AS password_hash,
      raw_user_meta_data->>'name'       AS name,
      raw_user_meta_data->>'avatar_url' AS image,
      created_at,
      updated_at
    FROM auth.users
    WHERE deleted_at IS NULL
  ) TO STDOUT WITH (FORMAT csv, HEADER true, NULL '')" \
  > "$EXPORT_DIR/auth_users.csv"

echo "  ✓ Exported to $EXPORT_DIR/auth_users.csv"

echo ""
echo "=== Done! Next: run import-to-vps.sh on the VPS ==="
