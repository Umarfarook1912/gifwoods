-- Alter products table to add specifications JSONB column
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '[]'::jsonb;
