-- Exclusive GST (18%) on product subtotal; shipping is not taxed.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS gst_amount NUMERIC(10,2) NOT NULL DEFAULT 0
  CHECK (gst_amount >= 0);

COMMENT ON COLUMN orders.gst_amount IS
  'GST charged on product subtotal (exclusive). Shipping is excluded.';
