-- Wishlist feature was never used; remove leftover schema.
DROP POLICY IF EXISTS "Users can manage their own wishlist" ON public.wishlists;
DROP TABLE IF EXISTS public.wishlists;
