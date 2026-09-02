"use client";

import { CheckCircle2 } from "lucide-react";
import {
  getPasswordStrength,
  getPasswordStrengthScore,
  PASSWORD_STRENGTH_RULES,
} from "@/lib/auth/password-strength";
import { cn } from "@/lib/utils";

interface Props {
  password: string;
}

export function PasswordStrengthIndicator({ password }: Props) {
  if (!password.length) return null;

  const strength = getPasswordStrength(password);
  const strengthScore = getPasswordStrengthScore(strength);

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              strengthScore > i
                ? strengthScore === 1
                  ? "bg-destructive"
                  : strengthScore === 2
                    ? "bg-amber-400"
                    : "bg-emerald-500"
                : "bg-muted"
            )}
          />
        ))}
      </div>
      <ul className="space-y-0.5">
        {PASSWORD_STRENGTH_RULES.map(({ key, label }) => (
          <li
            key={key}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              strength[key] ? "text-emerald-600" : "text-muted-foreground"
            )}
          >
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
