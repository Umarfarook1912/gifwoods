-- Migration: self-managed password reset tokens
-- Works on Supabase TODAY and on plain Postgres after migration.
-- Replaces Supabase auth.admin.generateLink() recovery links.

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for token lookups (every reset-password request queries by token)
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token
  ON password_reset_tokens(token);

-- Clean up old tokens automatically (optional — can also run via cron)
COMMENT ON TABLE password_reset_tokens IS
  'Self-managed password reset tokens. Replaces Supabase auth.admin.generateLink(). Compatible with plain Postgres.';
