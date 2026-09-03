#!/bin/bash
# Phase 2 — Import data into VPS PostgreSQL
# Run this on your Hostinger VPS after schema is applied.
#
# Prerequisites:
#   1. Run db/migrations/001_initial_schema.sql on the VPS first
#   2. Copy db/export/ files to the VPS
#
# Usage (on VPS):
#   export DB_URL="postgresql://gifwoods_admin:ADMIN_PASS@localhost:5432/gifwoods"
#   chmod +x import-to-vps.sh
#   ./import-to-vps.sh

set -e

DB_URL="${DB_URL:-postgresql://gifwoods_admin:CHANGE_ME@localhost:5432/gifwoods}"
EXPORT_DIR="./db/export"

echo "=== Step 1: Import users from auth_users.csv ==="
# encrypted_password IS bcrypt format ($2a$10$...) — bcryptjs reads it natively
psql "$DB_URL" -c "
COPY users(id, email, password_hash, name, image, created_at, updated_at)
FROM '${EXPORT_DIR}/auth_users.csv'
WITH (FORMAT csv, HEADER true, NULL '');
"
echo "  ✓ Users imported"

echo ""
echo "=== Step 2: Import profiles, categories, products, orders, reviews, addresses ==="
# FK order: profiles → categories → products → orders → order_items → reviews → addresses → tokens
psql "$DB_URL" -f "$EXPORT_DIR/gifwoods_data.sql"
echo "  ✓ All tables imported"

echo ""
echo "=== Step 3: Verify FK integrity ==="
psql "$DB_URL" -c "
SELECT
  'profiles missing user' AS check,
  COUNT(*) AS broken_count
FROM profiles p
LEFT JOIN users u ON u.id = p.id
WHERE u.id IS NULL;
"

psql "$DB_URL" -c "
SELECT
  'orders missing profile' AS check,
  COUNT(*) AS broken_count
FROM orders o
LEFT JOIN profiles p ON p.id = o.user_id
WHERE p.id IS NULL;
"

echo ""
echo "=== All checks done. Review broken_count — must be 0 before cutover. ==="
