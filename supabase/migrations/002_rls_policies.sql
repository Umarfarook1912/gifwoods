-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- CATEGORIES (public read, admin write)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- PRODUCTS (public read active, admin all)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage all products"
  ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- CART ITEMS (own user only)
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own cart"
  ON cart_items FOR ALL USING (auth.uid() = user_id);

-- ORDERS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders"
  ON orders FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ORDER ITEMS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert order items"
  ON order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all order items"
  ON order_items FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- REVIEWS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews"
  ON reviews FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can view their own reviews"
  ON reviews FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create reviews for purchased products"
  ON reviews FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.user_id = auth.uid()
        AND oi.product_id = product_id
        AND o.status = 'delivered'
    )
  );

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews"
  ON reviews FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- WISHLISTS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own wishlist"
  ON wishlists FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- SEED DATA
-- =============================================
INSERT INTO categories (name, slug, description, image_url) VALUES
  ('Personalized', 'personalized', 'Custom gifts with names, photos, and messages', 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800'),
  ('Weddings', 'weddings', 'Elegant gifts and hampers for weddings', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800'),
  ('Corporate', 'corporate', 'Branded gifts for teams and clients', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800'),
  ('Birthdays', 'birthdays', 'Celebrate birthdays with unique gifts', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'),
  ('Hampers', 'hampers', 'Curated luxury gift hampers', 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=800'),
  ('Anniversary', 'anniversary', 'Romantic gifts for anniversaries', 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800')
ON CONFLICT (slug) DO NOTHING;
