"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface Props {
  images: string[];
  name: string;
}

export function ProductImageGallery({ images, name }: Props) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
        {images[selected] ? (
          <Image
            src={images[selected]}
            alt={name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full bg-cream flex items-center justify-center text-muted-foreground/30">
            No image
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={cn(
                "relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors",
                selected === i ? "border-gold" : "border-border hover:border-gold/50"
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img}
                alt={`${name} - ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
