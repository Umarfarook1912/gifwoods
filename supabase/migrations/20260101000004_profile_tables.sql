-- Addresses Table
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- e.g., "Home", "Office", "Shipping"
  phone TEXT NOT NULL,
  street_address TEXT NOT NULL,
  apartment TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default_shipping BOOLEAN NOT NULL DEFAULT false,
  is_default_billing BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own addresses" ON public.addresses;
CREATE POLICY "Users can manage their own addresses"
  ON public.addresses FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all addresses" ON public.addresses;
CREATE POLICY "Admins can view all addresses"
  ON public.addresses FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Payment Methods Table (Mock/Stored Tokens)
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL DEFAULT 'stripe', -- "stripe", "razorpay", "cashfree"
  method_type TEXT NOT NULL, -- "card", "upi", "wallet"
  last4 TEXT, -- for cards
  brand TEXT, -- "visa", "mastercard"
  upi_id TEXT, -- e.g. user@okhdfc
  wallet_name TEXT, -- e.g. "Paytm", "PhonePe"
  expiry_month INTEGER,
  expiry_year INTEGER,
  token TEXT NOT NULL, -- token identifier
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON public.payment_methods(user_id);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own payment methods" ON public.payment_methods;
CREATE POLICY "Users can manage their own payment methods"
  ON public.payment_methods FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all payment methods" ON public.payment_methods;
CREATE POLICY "Admins can view all payment methods"
  ON public.payment_methods FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Auto-update updated_at column triggers
CREATE OR REPLACE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON public.addresses FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
