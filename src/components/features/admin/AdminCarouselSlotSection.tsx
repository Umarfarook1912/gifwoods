"use client";

import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  HOMEPAGE_CAROUSEL_COPY,
  HOMEPAGE_CAROUSEL_SIZES,
  HOMEPAGE_CAROUSEL_SLOT_LABELS,
} from "@/constants/homepage-carousel";
import type {
  HomepageCarouselDraftSlide,
  HomepageCarouselSlot,
} from "@/types/homepage-carousel";

interface Props {
  slot: HomepageCarouselSlot;
  drafts: HomepageCarouselDraftSlide[];
  onChange: (drafts: HomepageCarouselDraftSlide[]) => void;
}

function emptyDraft(sortOrder: number): HomepageCarouselDraftSlide {
  return {
    clientId: crypto.randomUUID(),
    image_url: "",
    link_url: "",
    alt_text: "",
    headline: "",
    subheadline: "",
    cta_label: "",
    sort_order: sortOrder,
    is_active: true,
  };
}

export function AdminCarouselSlotSection({ slot, drafts, onChange }: Props) {
  const size = HOMEPAGE_CAROUSEL_SIZES[slot];

  const update = (clientId: string, patch: Partial<HomepageCarouselDraftSlide>) => {
    onChange(drafts.map((d) => (d.clientId === clientId ? { ...d, ...patch } : d)));
  };

  const remove = (clientId: string) => {
    onChange(drafts.filter((d) => d.clientId !== clientId));
  };

  const add = () => {
    const nextSort = drafts.length === 0 ? 0 : Math.max(...drafts.map((d) => d.sort_order)) + 1;
    onChange([...drafts, emptyDraft(nextSort)]);
  };

  return (
    <section className="space-y-3 rounded-xl border border-border bg-cream/40 p-3">
      <div>
        <h3 className="text-sm font-semibold text-dark">
          {HOMEPAGE_CAROUSEL_SLOT_LABELS[slot]}
        </h3>
        <p className="text-xs text-warm-gray">
          {size.width} × {size.height} px ({size.ratioLabel})
        </p>
      </div>

      <div className="space-y-3">
        {drafts.length === 0 ? (
          <p className="text-xs text-warm-gray">{HOMEPAGE_CAROUSEL_COPY.EMPTY_SLOT}</p>
        ) : (
          drafts.map((draft, index) => (
            <div
              key={draft.clientId}
              className="space-y-2 rounded-lg border border-border bg-white p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-warm-gray">Slide {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => remove(draft.clientId)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div>
                <Label>{HOMEPAGE_CAROUSEL_COPY.IMAGE_URL_LABEL}</Label>
                <Input
                  value={draft.image_url}
                  onChange={(e) => update(draft.clientId, { image_url: e.target.value })}
                  placeholder={HOMEPAGE_CAROUSEL_COPY.IMAGE_URL_PLACEHOLDER}
                  className="mt-1"
                />
                {draft.image_url.trim() && (
                  <div className="relative mt-2 h-20 w-full overflow-hidden rounded-md border border-border bg-cream">
                    <Image
                      src={draft.image_url.trim()}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </div>

              <div>
                <Label>{HOMEPAGE_CAROUSEL_COPY.LINK_URL_LABEL}</Label>
                <Input
                  value={draft.link_url}
                  onChange={(e) => update(draft.clientId, { link_url: e.target.value })}
                  placeholder={HOMEPAGE_CAROUSEL_COPY.LINK_URL_PLACEHOLDER}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>{HOMEPAGE_CAROUSEL_COPY.HEADLINE_LABEL}</Label>
                <Input
                  value={draft.headline}
                  onChange={(e) => update(draft.clientId, { headline: e.target.value })}
                  placeholder={HOMEPAGE_CAROUSEL_COPY.HEADLINE_PLACEHOLDER}
                  className="mt-1"
                />
                <p className="mt-1 text-[11px] text-warm-gray">
                  {HOMEPAGE_CAROUSEL_COPY.HEADLINE_EXAMPLE}
                </p>
              </div>

              <div>
                <Label>{HOMEPAGE_CAROUSEL_COPY.SUBHEADLINE_LABEL}</Label>
                <Input
                  value={draft.subheadline}
                  onChange={(e) => update(draft.clientId, { subheadline: e.target.value })}
                  placeholder={HOMEPAGE_CAROUSEL_COPY.SUBHEADLINE_PLACEHOLDER}
                  className="mt-1"
                />
                <p className="mt-1 text-[11px] text-warm-gray">
                  {HOMEPAGE_CAROUSEL_COPY.SUBHEADLINE_EXAMPLE}
                </p>
              </div>

              <div>
                <Label>{HOMEPAGE_CAROUSEL_COPY.CTA_LABEL}</Label>
                <Input
                  value={draft.cta_label}
                  onChange={(e) => update(draft.clientId, { cta_label: e.target.value })}
                  placeholder={HOMEPAGE_CAROUSEL_COPY.CTA_PLACEHOLDER}
                  className="mt-1"
                />
                <p className="mt-1 text-[11px] text-warm-gray">
                  {HOMEPAGE_CAROUSEL_COPY.CTA_EXAMPLE}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>{HOMEPAGE_CAROUSEL_COPY.ALT_LABEL}</Label>
                  <Input
                    value={draft.alt_text}
                    onChange={(e) => update(draft.clientId, { alt_text: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{HOMEPAGE_CAROUSEL_COPY.SORT_LABEL}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={draft.sort_order}
                    onChange={(e) =>
                      update(draft.clientId, {
                        sort_order: Number.parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>{HOMEPAGE_CAROUSEL_COPY.ACTIVE_LABEL}</Label>
                <Switch
                  checked={draft.is_active}
                  onCheckedChange={(v) => update(draft.clientId, { is_active: v })}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <Button type="button" variant="outline" className="w-full gap-1" onClick={add}>
        <Plus className="h-3.5 w-3.5" />
        {HOMEPAGE_CAROUSEL_COPY.ADD_SLIDE}
      </Button>
    </section>
  );
}
