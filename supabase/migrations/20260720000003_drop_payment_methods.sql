DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON public.payment_methods;

DROP POLICY IF EXISTS "Users can manage their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Admins can view all payment methods" ON public.payment_methods;

DROP TABLE IF EXISTS public.payment_methods;
