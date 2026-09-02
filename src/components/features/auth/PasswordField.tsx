"use client";

import { Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggleShow: () => void;
  error?: string;
  autoComplete: string;
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
  error,
  autoComplete,
}: Props) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-dark">
        {label}
      </Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder="••••••••"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "pl-9 pr-9",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-dark transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
