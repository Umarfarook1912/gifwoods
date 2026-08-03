"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-gold" />,
        info: <InfoIcon className="size-4 text-gold" />,
        warning: <TriangleAlertIcon className="size-4 text-gold" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin text-gold" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "cn-toast group toast border border-border bg-white text-dark shadow-lg rounded-2xl px-4 py-3 gap-3",
          title: "text-sm font-semibold text-dark",
          description: "text-xs text-warm-gray leading-relaxed",
          success: "border-gold/30 bg-cream",
          info: "border-border bg-white",
          error: "border-destructive/30 bg-white",
          actionButton: "bg-gold text-dark font-semibold",
          cancelButton: "bg-muted text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
