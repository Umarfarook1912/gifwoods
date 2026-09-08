-- Optional promotional copy overlays for homepage carousel slides.
ALTER TABLE homepage_carousel_slides
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS subheadline TEXT,
  ADD COLUMN IF NOT EXISTS cta_label TEXT;

COMMENT ON COLUMN homepage_carousel_slides.headline IS
  'Optional overlay title shown on the carousel slide.';
COMMENT ON COLUMN homepage_carousel_slides.subheadline IS
  'Optional overlay supporting line under the headline.';
COMMENT ON COLUMN homepage_carousel_slides.cta_label IS
  'Optional CTA button label on the slide overlay.';
