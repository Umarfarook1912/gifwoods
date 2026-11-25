-- Per-product shipping: normal base charge + Fast surcharge (both × qty at checkout).
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS shipping_charge NUMERIC(10,2) NOT NULL DEFAULT 0
    CHECK (shipping_charge >= 0),
  ADD COLUMN IF NOT EXISTS fast_shipping_charge NUMERIC(10,2) NOT NULL DEFAULT 0
    CHECK (fast_shipping_charge >= 0);

COMMENT ON COLUMN products.shipping_charge IS
  'Normal delivery charge per unit (INR). Cart total = sum(shipping_charge × qty).';
COMMENT ON COLUMN products.fast_shipping_charge IS
  'Fast delivery surcharge per unit (INR), added on top of shipping_charge when Fast is selected.';
