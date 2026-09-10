-- Timed product offers: percent or flat amount off regular price.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS offer_type TEXT
    CHECK (offer_type IS NULL OR offer_type IN ('percent', 'amount')),
  ADD COLUMN IF NOT EXISTS offer_value NUMERIC(10,2)
    CHECK (offer_value IS NULL OR offer_value > 0),
  ADD COLUMN IF NOT EXISTS offer_starts_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS offer_ends_at TIMESTAMPTZ;

COMMENT ON COLUMN products.offer_type IS
  'Timed offer discount type: percent or amount. Null = no offer.';
COMMENT ON COLUMN products.offer_value IS
  'Offer magnitude: percent (e.g. 20) or flat INR amount off regular price.';
COMMENT ON COLUMN products.offer_starts_at IS
  'Offer window start (inclusive).';
COMMENT ON COLUMN products.offer_ends_at IS
  'Offer window end (inclusive).';

CREATE INDEX IF NOT EXISTS products_active_offers_idx
  ON products (offer_starts_at, offer_ends_at)
  WHERE offer_type IS NOT NULL AND status = 'active';
