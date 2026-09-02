export const PASSWORD_STRENGTH_RULES = [
  { key: "length", label: "At least 6 characters" },
  { key: "upper", label: "One uppercase letter" },
  { key: "number", label: "One number" },
] as const;

export type PasswordStrengthKey = (typeof PASSWORD_STRENGTH_RULES)[number]["key"];

export interface PasswordStrength {
  length: boolean;
  upper: boolean;
  number: boolean;
}

export function getPasswordStrength(password: string): PasswordStrength {
  return {
    length: password.length >= 6,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };
}

export function getPasswordStrengthScore(strength: PasswordStrength): number {
  return Object.values(strength).filter(Boolean).length;
}

export function isPasswordStrongEnough(strength: PasswordStrength): boolean {
  return strength.length && strength.upper && strength.number;
}
