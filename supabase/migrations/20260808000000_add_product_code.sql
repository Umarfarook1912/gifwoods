-- Add product code (SKU) column to products.
-- Codes are human-assigned SKUs (e.g. GF-WA-004) and may repeat across variants,
-- so this is a plain indexed TEXT column (not unique).
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS code TEXT;

CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(code);
