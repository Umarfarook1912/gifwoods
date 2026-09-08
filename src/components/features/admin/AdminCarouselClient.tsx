"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { DataTable } from "./DataTable";
import { AdminPageHeader } from "./AdminListSection";
import { AdminCarouselOffcanvas } from "./AdminCarouselOffcanvas";
import { CarouselSizeGuide } from "./CarouselSizeGuide";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/constants/api";
import { ADMIN_PAGE } from "@/constants/admin-ui";
import { carouselSlideDeleteConfirmation } from "@/constants/confirmations";
import {
  HOMEPAGE_CAROUSEL_COPY,
  HOMEPAGE_CAROUSEL_SLOT_LABELS,
} from "@/constants/homepage-carousel";
import { APP_ERRORS } from "@/constants/errors";
import { useConfirm } from "@/hooks/useConfirm";
import { toastError } from "@/lib/errors/toast";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import type { HomepageCarouselSlide } from "@/types/homepage-carousel";

interface Props {
  initialSlides: HomepageCarouselSlide[];
}

export function AdminCarouselClient({ initialSlides }: Props) {
  const confirm = useConfirm();
  const router = useRouter();
  const [slides, setSlides] = useState(initialSlides);
  const [refreshing, setRefreshing] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => setSlides(initialSlides), [initialSlides]);

  const leftCount = slides.filter((s) => s.slot === "left").length;
  const rightCount = slides.length - leftCount;

  const handleDelete = async (slide: HomepageCarouselSlide) => {
    const label = `${HOMEPAGE_CAROUSEL_SLOT_LABELS[slide.slot]} slide`;
    if (!(await confirm(carouselSlideDeleteConfirmation(label)))) return;
    setDeletingId(slide.id);
    try {
      const res = await fetch(API_ENDPOINTS.HOMEPAGE_CAROUSEL_SLIDE(slide.id), {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? APP_ERRORS.CAROUSEL_DELETE_FAILED);
      setSlides((prev) => prev.filter((s) => s.id !== slide.id));
      toast.success("Slide deleted");
    } catch (e) {
      toastError(e, APP_ERRORS.CAROUSEL_DELETE_FAILED);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={ADMIN_PAGE.shell}>
      <AdminPageHeader title={HOMEPAGE_CAROUSEL_COPY.ADMIN_TITLE}>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={refreshing}
          onClick={() => {
            setRefreshing(true);
            router.refresh();
            setTimeout(() => setRefreshing(false), 1000);
          }}
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          Refresh
        </Button>
        <Button
          className="gap-2 bg-gold font-semibold text-dark hover:bg-gold-dark"
          onClick={() => setPanelOpen(true)}
        >
          <Plus className="h-4 w-4" />
          {HOMEPAGE_CAROUSEL_COPY.MANAGE_CAROUSEL}
        </Button>
      </AdminPageHeader>

      <p className="mb-4 text-sm text-warm-gray">{HOMEPAGE_CAROUSEL_COPY.ADMIN_SUBTITLE}</p>
      <CarouselSizeGuide leftCount={leftCount} rightCount={rightCount} />

      <DataTable
        data={slides}
        total={slides.length}
        emptyMessage={HOMEPAGE_CAROUSEL_COPY.EMPTY}
        keyExtractor={(s) => s.id}
        columns={[
          {
            key: "preview",
            label: "Preview",
            render: (slide) => (
              <div className="relative h-12 w-20 overflow-hidden rounded-md border border-border bg-cream">
                <Image
                  src={slide.image_url}
                  alt={slide.alt_text ?? ""}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ),
          },
          {
            key: "slot",
            label: "Side",
            render: (slide) => (
              <Badge variant="secondary">{HOMEPAGE_CAROUSEL_SLOT_LABELS[slide.slot]}</Badge>
            ),
          },
          {
            key: "link",
            label: "Link",
            render: (slide) => (
              <span className="max-w-[220px] truncate text-sm text-warm-gray">
                {slide.link_url}
              </span>
            ),
          },
          {
            key: "sort",
            label: "Order",
            render: (slide) => <span className="text-warm-gray">{slide.sort_order}</span>,
          },
          {
            key: "status",
            label: "Status",
            render: (slide) => (
              <Badge variant={slide.is_active ? "default" : "outline"}>
                {slide.is_active ? "Active" : "Hidden"}
              </Badge>
            ),
          },
          {
            key: "actions",
            label: "",
            render: (slide) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => setPanelOpen(true)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={deletingId === slide.id}
                  onClick={() => handleDelete(slide)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <AdminCarouselOffcanvas
        open={panelOpen}
        slides={slides}
        onClose={() => setPanelOpen(false)}
        onSaved={setSlides}
      />
    </div>
  );
}
