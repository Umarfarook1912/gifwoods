import Image from "next/image";
import { ASSETS } from "@/constants/assets";
import { SITE_NAME } from "@/constants/ui";
import { cn } from "@/lib/utils/cn";

interface Props {
  className?: string;
  priority?: boolean;
}

export function BrandLogo({ className, priority = false }: Props) {
  return (
    <Image
      src={ASSETS.LOGO}
      alt={SITE_NAME}
      width={160}
      height={40}
      priority={priority}
      className={cn("h-15 w-auto object-contain", className)}
    />
  );
}
