-- Default per-product shipping charges to ₹60 (admin can override per product).
ALTER TABLE products
  ALTER COLUMN shipping_charge SET DEFAULT 60,
  ALTER COLUMN fast_shipping_charge SET DEFAULT 60;

UPDATE products
SET
  shipping_charge = 60,
  fast_shipping_charge = 60
WHERE shipping_charge = 0
  AND fast_shipping_charge = 0;
