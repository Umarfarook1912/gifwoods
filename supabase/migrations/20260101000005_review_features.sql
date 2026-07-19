-- Alter reviews table to make order_id optional and add admin_reply
ALTER TABLE public.reviews ALTER COLUMN order_id DROP NOT NULL;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS admin_reply TEXT;

-- Drop old strict insert policy
DROP POLICY IF EXISTS "Users can create reviews for purchased products" ON public.reviews;

-- Create new policy allowing any logged-in user to create reviews
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );
