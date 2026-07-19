ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending'
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

UPDATE public.orders
SET payment_status = 'paid'
WHERE status IN ('paid', 'processing', 'shipped', 'delivered')
  AND payment_status = 'pending';

UPDATE public.orders
SET status = 'processing'
WHERE status = 'paid';
