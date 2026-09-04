-- Test products: Cashfree sandbox checkout on live (no real money); free shipping.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN products.is_test IS
  'Superadmin-only: checkout uses Cashfree TEST keys and zero shipping; hidden from public listings.';

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS is_test_order BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN orders.is_test_order IS
  'True when the cart was all test products; payment used Cashfree sandbox credentials.';
