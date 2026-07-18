"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

type RevealDelay = 0 | 1 | 2 | 3 | 4 | 5;

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger step (100ms each) applied once the element enters the viewport */
  delay?: RevealDelay;
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "reveal",
        visible && "reveal-visible",
        delay > 0 && `reveal-delay-${delay}`,
        className
      )}
    >
      {children}
    </div>
  );
}
