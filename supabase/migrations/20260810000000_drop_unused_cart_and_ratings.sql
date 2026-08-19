-- Remove unused schema leftovers.
-- cart_items: cart is stored in browser localStorage via Zustand (useCartStore), never queried.
-- product_ratings: view is unused; avg_rating / review_count are computed from reviews in the API.

DROP POLICY IF EXISTS "Users can manage their own cart" ON public.cart_items;
DROP TABLE IF EXISTS public.cart_items;

DROP VIEW IF EXISTS public.product_ratings;
