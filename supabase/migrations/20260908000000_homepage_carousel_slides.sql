-- Dual homepage carousels: wide left + short right promotional slides.
CREATE TABLE IF NOT EXISTS homepage_carousel_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot TEXT NOT NULL CHECK (slot IN ('left', 'right')),
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS homepage_carousel_slides_slot_sort_idx
  ON homepage_carousel_slides (slot, sort_order, created_at);

COMMENT ON TABLE homepage_carousel_slides IS
  'Homepage dual carousel slides. Left = wide banner; right = short banner.';

ALTER TABLE homepage_carousel_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active carousel slides"
  ON homepage_carousel_slides FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage carousel slides"
  ON homepage_carousel_slides FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );

DROP TRIGGER IF EXISTS homepage_carousel_slides_updated_at ON homepage_carousel_slides;
CREATE TRIGGER homepage_carousel_slides_updated_at
  BEFORE UPDATE ON homepage_carousel_slides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
