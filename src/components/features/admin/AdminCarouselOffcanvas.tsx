"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AdminCarouselSlotSection } from "./AdminCarouselSlotSection";
import { API_ENDPOINTS } from "@/constants/api";
import {
  HOMEPAGE_CAROUSEL_COPY,
  HOMEPAGE_CAROUSEL_SLOTS,
} from "@/constants/homepage-carousel";
import { APP_ERRORS } from "@/constants/errors";
import { toastError } from "@/lib/errors/toast";
import { toast } from "sonner";
import type {
  HomepageCarouselDraftSlide,
  HomepageCarouselSlide,
  HomepageCarouselSlot,
} from "@/types/homepage-carousel";

interface Props {
  open: boolean;
  slides: HomepageCarouselSlide[];
  onClose: () => void;
  onSaved: (slides: HomepageCarouselSlide[]) => void;
}

function toDrafts(
  slides: HomepageCarouselSlide[],
  slot: HomepageCarouselSlot
): HomepageCarouselDraftSlide[] {
  return slides
    .filter((s) => s.slot === slot)
    .map((s) => ({
      clientId: s.id,
      id: s.id,
      image_url: s.image_url,
      link_url: s.link_url,
      alt_text: s.alt_text ?? "",
      headline: s.headline ?? "",
      subheadline: s.subheadline ?? "",
      cta_label: s.cta_label ?? "",
      sort_order: s.sort_order,
      is_active: s.is_active,
    }));
}

function isFilled(draft: HomepageCarouselDraftSlide): boolean {
  return Boolean(draft.image_url.trim() && draft.link_url.trim());
}

export function AdminCarouselOffcanvas({ open, slides, onClose, onSaved }: Props) {
  const [left, setLeft] = useState<HomepageCarouselDraftSlide[]>([]);
  const [right, setRight] = useState<HomepageCarouselDraftSlide[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLeft(toDrafts(slides, HOMEPAGE_CAROUSEL_SLOTS.LEFT));
    setRight(toDrafts(slides, HOMEPAGE_CAROUSEL_SLOTS.RIGHT));
  }, [open, slides]);

  const handleSave = async () => {
    const leftFilled = left.filter(isFilled);
    const rightFilled = right.filter(isFilled);
    const incomplete = [...left, ...right].some(
      (d) => (d.image_url.trim() || d.link_url.trim()) && !isFilled(d)
    );
    if (incomplete) {
      toast.error("Each slide needs both an image URL and a navigation link.");
      return;
    }

    const keptIds = new Set(
      [...leftFilled, ...rightFilled].map((d) => d.id).filter(Boolean) as string[]
    );
    const toDelete = slides.filter((s) => !keptIds.has(s.id));

    setSaving(true);
    try {
      for (const slide of toDelete) {
        const res = await fetch(API_ENDPOINTS.HOMEPAGE_CAROUSEL_SLIDE(slide.id), {
          method: "DELETE",
        });
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error ?? APP_ERRORS.CAROUSEL_DELETE_FAILED);
      }

      const saveDraft = async (
        draft: HomepageCarouselDraftSlide,
        slot: HomepageCarouselSlot
      ) => {
        const payload = {
          slot,
          image_url: draft.image_url.trim(),
          link_url: draft.link_url.trim(),
          alt_text: draft.alt_text.trim() || null,
          headline: draft.headline.trim() || null,
          subheadline: draft.subheadline.trim() || null,
          cta_label: draft.cta_label.trim() || null,
          sort_order: draft.sort_order,
          is_active: draft.is_active,
        };
        const res = await fetch(
          draft.id
            ? API_ENDPOINTS.HOMEPAGE_CAROUSEL_SLIDE(draft.id)
            : API_ENDPOINTS.HOMEPAGE_CAROUSEL,
          {
            method: draft.id ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error ?? APP_ERRORS.CAROUSEL_SAVE_FAILED);
      };

      for (const draft of leftFilled) {
        await saveDraft(draft, HOMEPAGE_CAROUSEL_SLOTS.LEFT);
      }
      for (const draft of rightFilled) {
        await saveDraft(draft, HOMEPAGE_CAROUSEL_SLOTS.RIGHT);
      }

      const refresh = await fetch(`${API_ENDPOINTS.HOMEPAGE_CAROUSEL}?all=true`);
      const refreshJson = await refresh.json();
      if (!refresh.ok || refreshJson.error) {
        throw new Error(refreshJson.error ?? APP_ERRORS.CAROUSEL_LOAD_FAILED);
      }

      onSaved(refreshJson.data as HomepageCarouselSlide[]);
      toast.success("Carousel saved");
      onClose();
    } catch (e) {
      toastError(e, APP_ERRORS.CAROUSEL_SAVE_FAILED);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 data-[side=right]:w-[min(100%,72rem)] data-[side=right]:sm:max-w-none data-[side=right]:md:max-w-5xl data-[side=right]:lg:max-w-6xl data-[side=right]:xl:max-w-7xl"
      >
        <SheetHeader className="border-b border-border">
          <SheetTitle>{HOMEPAGE_CAROUSEL_COPY.OFFCANVAS_TITLE}</SheetTitle>
          <SheetDescription>{HOMEPAGE_CAROUSEL_COPY.OFFCANVAS_DESC}</SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 grid-cols-1 items-start gap-5 overflow-y-auto p-4 lg:grid-cols-2">
          <AdminCarouselSlotSection
            slot={HOMEPAGE_CAROUSEL_SLOTS.LEFT}
            drafts={left}
            onChange={setLeft}
          />
          <AdminCarouselSlotSection
            slot={HOMEPAGE_CAROUSEL_SLOTS.RIGHT}
            drafts={right}
            onChange={setRight}
          />
        </div>

        <SheetFooter className="shrink-0 border-t border-border">
          <Button
            className="w-full bg-gold font-semibold text-dark hover:bg-gold-dark"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : HOMEPAGE_CAROUSEL_COPY.SAVE_ALL}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
