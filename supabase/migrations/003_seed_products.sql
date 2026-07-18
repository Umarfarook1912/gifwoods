-- Seed products for development (references category IDs by slug lookup)
INSERT INTO products (name, slug, description, price, original_price, category_id, images, tags, stock, is_featured, badge, status)
SELECT
  'Engraved Memory Frame',
  'engraved-memory-frame',
  'A beautifully crafted wooden photo frame with laser-engraved personalization. Perfect for preserving your most cherished memories in style.',
  1899,
  2499,
  c.id,
  ARRAY['https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800'],
  ARRAY['photo', 'engraved', 'wood', 'personalized'],
  150,
  true,
  'Personalize',
  'active'
FROM categories c WHERE c.slug = 'personalized'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, original_price, category_id, images, tags, stock, is_featured, badge, status)
SELECT
  'Amber Glow Candle',
  'amber-glow-candle',
  'Hand-poured soy wax candle with amber and sandalwood fragrance. Comes in signature Gifwoods packaging with a handwritten note.',
  1299,
  1599,
  c.id,
  ARRAY['https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800'],
  ARRAY['candle', 'fragrance', 'luxury', 'handmade'],
  200,
  true,
  'Bestseller',
  'active'
FROM categories c WHERE c.slug = 'hampers'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, original_price, category_id, images, tags, stock, is_featured, badge, status)
SELECT
  'Heritage Leather Journal',
  'heritage-leather-journal',
  'Full-grain leather journal with gilded edges, personalized with your name or initials. 200 cream-white pages perfect for thoughts and stories.',
  2499,
  2999,
  c.id,
  ARRAY['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800'],
  ARRAY['journal', 'leather', 'personalized', 'stationery'],
  75,
  true,
  'New',
  'active'
FROM categories c WHERE c.slug = 'personalized'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, original_price, category_id, images, tags, stock, is_featured, badge, status)
SELECT
  'Grand Celebration Hamper',
  'grand-celebration-hamper',
  'A luxurious hamper filled with artisanal chocolates, premium teas, scented candles, and a personalized greeting card — all wrapped in our signature gift box.',
  4999,
  6499,
  c.id,
  ARRAY['https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=800'],
  ARRAY['hamper', 'luxury', 'celebration', 'premium'],
  50,
  true,
  'Limited',
  'active'
FROM categories c WHERE c.slug = 'hampers'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, original_price, category_id, images, tags, stock, is_featured, badge, status)
SELECT
  'Personalized Wooden Name Board',
  'personalized-wooden-name-board',
  'Handcrafted wooden name board with intricate laser-cut design. Customize with any name or text in your choice of font.',
  1599,
  1999,
  c.id,
  ARRAY['https://images.unsplash.com/photo-1584811644165-33db5f450906?w=800'],
  ARRAY['wood', 'name board', 'personalized', 'decor'],
  120,
  false,
  'Personalize',
  'active'
FROM categories c WHERE c.slug = 'personalized'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, original_price, category_id, images, tags, stock, is_featured, badge, status)
SELECT
  'Wedding Memory Box',
  'wedding-memory-box',
  'An heirloom-quality keepsake box engraved with wedding date and couple names. Holds rings, notes, and tokens from your special day.',
  3499,
  4499,
  c.id,
  ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800'],
  ARRAY['wedding', 'keepsake', 'memory box', 'engraved'],
  40,
  true,
  'Bestseller',
  'active'
FROM categories c WHERE c.slug = 'weddings'
ON CONFLICT (slug) DO NOTHING;
