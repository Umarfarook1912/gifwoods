"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ImageOff } from "lucide-react";
import type { ProductSpecification } from "@/types/product";

interface ImageListFieldProps {
  images: string[];
  onChange: (images: string[]) => void;
}

function ImagePreview({ src }: { src: string }) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <div className="h-9 w-9 flex-shrink-0 rounded border border-border bg-muted flex items-center justify-center">
        <ImageOff className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="h-9 w-9 flex-shrink-0 rounded border border-border object-cover bg-muted"
      onError={() => setErrored(true)}
    />
  );
}

export function ImageListField({ images, onChange }: ImageListFieldProps) {
  return (
    <div className="rounded-xl border border-border bg-cream/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <Label className="font-semibold text-dark">Product Images</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...images, ""])}
          className="h-8 text-xs gap-1 border-gold/40 text-dark hover:bg-gold/10"
        >
          <Plus className="h-3.5 w-3.5" /> Add Image URL
        </Button>
      </div>
      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
        {images.map((img, index) => (
          <div key={index} className="flex gap-2 items-center">
            <ImagePreview src={img} />
            <Input
              placeholder="https://example.com/image.jpg"
              value={img}
              onChange={(e) => {
                const next = [...images];
                next[index] = e.target.value;
                onChange(next);
              }}
              className="flex-1 text-sm h-9 bg-white"
            />
            {images.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onChange(images.filter((_, i) => i !== index))}
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface SpecificationListFieldProps {
  specifications: ProductSpecification[];
  onChange: (specifications: ProductSpecification[]) => void;
}

export function SpecificationListField({
  specifications,
  onChange,
}: SpecificationListFieldProps) {
  const update = (index: number, field: keyof ProductSpecification, value: string) => {
    const next = [...specifications];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  return (
    <div className="rounded-xl border border-border bg-cream/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <Label className="font-semibold text-dark">Specifications</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...specifications, { key: "", value: "" }])}
          className="h-8 text-xs gap-1 border-gold/40 text-dark hover:bg-gold/10"
        >
          <Plus className="h-3.5 w-3.5" /> Add Specification
        </Button>
      </div>
      {specifications.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          No specifications added yet — e.g. Material, Dimensions, Weight.
        </p>
      ) : (
        <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
          {specifications.map((spec, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                placeholder="Label (e.g. Weight)"
                value={spec.key}
                onChange={(e) => update(index, "key", e.target.value)}
                className="flex-1 text-sm h-9 bg-white"
              />
              <Input
                placeholder="Value (e.g. 250g)"
                value={spec.value}
                onChange={(e) => update(index, "value", e.target.value)}
                className="flex-1 text-sm h-9 bg-white"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onChange(specifications.filter((_, i) => i !== index))}
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
