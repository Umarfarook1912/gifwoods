ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_products_bestseller ON public.products(is_bestseller);
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON public.products(is_new_arrival);

UPDATE public.products
SET is_bestseller = true
WHERE is_featured = true
   OR badge = 'Bestseller';

UPDATE public.products
SET is_new_arrival = true
WHERE badge = 'New';
