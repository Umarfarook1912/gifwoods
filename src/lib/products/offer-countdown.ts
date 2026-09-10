export interface OfferCountdownParts {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

export function getOfferCountdownParts(
  endsAt: string,
  nowMs = Date.now()
): OfferCountdownParts {
  const endMs = new Date(endsAt).getTime();
  if (Number.isNaN(endMs)) {
    return { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const totalMs = Math.max(0, endMs - nowMs);
  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  return {
    totalMs,
    days,
    hours,
    minutes,
    seconds,
    expired: totalMs <= 0,
  };
}

export function padCountdownUnit(value: number): string {
  return String(value).padStart(2, "0");
}
