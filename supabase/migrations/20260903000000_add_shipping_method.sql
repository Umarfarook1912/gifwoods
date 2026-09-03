-- Delivery speed chosen at checkout (normal | fast). Fast adds FAST_DELIVERY_FEE in app.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_method TEXT NOT NULL DEFAULT 'normal'
  CHECK (shipping_method IN ('normal', 'fast'));

COMMENT ON COLUMN orders.shipping_method IS
  'Customer delivery speed: normal or fast (+₹60 surcharge). Informs packing priority; Shiprocket Ship Now still assigns courier.';
