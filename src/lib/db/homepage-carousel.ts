/**
 * DB service — Homepage dual carousel slides
 */
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  HomepageCarouselSlide,
  HomepageCarouselSlideInput,
} from "@/types/homepage-carousel";

const SLIDE_SELECT =
  "id, slot, image_url, link_url, alt_text, headline, subheadline, cta_label, sort_order, is_active, created_at, updated_at";

/** Active slides for the public homepage, ordered per slot. */
export async function getActiveHomepageCarouselSlides(): Promise<HomepageCarouselSlide[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("homepage_carousel_slides")
    .select(SLIDE_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as HomepageCarouselSlide[];
}

/** All slides for admin management. */
export async function getAllHomepageCarouselSlides(): Promise<HomepageCarouselSlide[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("homepage_carousel_slides")
    .select(SLIDE_SELECT)
    .order("slot", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as HomepageCarouselSlide[];
}

export async function createHomepageCarouselSlide(
  input: HomepageCarouselSlideInput
): Promise<HomepageCarouselSlide> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("homepage_carousel_slides")
    .insert({
      slot: input.slot,
      image_url: input.image_url,
      link_url: input.link_url,
      alt_text: input.alt_text?.trim() || null,
      headline: input.headline?.trim() || null,
      subheadline: input.subheadline?.trim() || null,
      cta_label: input.cta_label?.trim() || null,
      sort_order: input.sort_order ?? 0,
      is_active: input.is_active ?? true,
    })
    .select(SLIDE_SELECT)
    .single();

  if (error) throw error;
  return data as HomepageCarouselSlide;
}

export async function updateHomepageCarouselSlide(
  id: string,
  input: HomepageCarouselSlideInput
): Promise<HomepageCarouselSlide> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("homepage_carousel_slides")
    .update({
      slot: input.slot,
      image_url: input.image_url,
      link_url: input.link_url,
      alt_text: input.alt_text?.trim() || null,
      headline: input.headline?.trim() || null,
      subheadline: input.subheadline?.trim() || null,
      cta_label: input.cta_label?.trim() || null,
      sort_order: input.sort_order ?? 0,
      is_active: input.is_active ?? true,
    })
    .eq("id", id)
    .select(SLIDE_SELECT)
    .single();

  if (error) throw error;
  return data as HomepageCarouselSlide;
}

export async function deleteHomepageCarouselSlide(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("homepage_carousel_slides")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
