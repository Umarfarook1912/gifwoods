ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS customization_text BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS customization_image BOOLEAN NOT NULL DEFAULT false;
