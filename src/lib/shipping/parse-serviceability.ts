import { DEFAULT_TRANSIT_DAYS } from "@/constants/shipping";
import type { ShiprocketCourierCompany } from "@/types/shiprocket";

function parseNumericRange(
  value: string | number | undefined
): { min: number; max: number } | null {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    const days = Math.max(1, Math.round(value));
    return { min: days, max: days };
  }

  const numbers = String(value)
    .match(/\d+/g)
    ?.map((part) => Number(part))
    .filter((part) => part > 0 && part <= 30);

  if (!numbers?.length) return null;

  return {
    min: Math.min(...numbers),
    max: Math.max(...numbers),
  };
}

function daysUntilDate(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const timestamp = Date.parse(trimmed);
  if (Number.isNaN(timestamp)) return null;

  const days = Math.ceil((timestamp - Date.now()) / 86_400_000);
  return days > 0 ? days : 1;
}

function daysFromHours(hours: number | undefined): number | null {
  if (!hours || hours <= 0) return null;
  return Math.max(1, Math.ceil(hours / 24));
}

function getCourierTransit(
  courier: ShiprocketCourierCompany
): { min: number; max: number } | null {
  const fromEstimatedDays = parseNumericRange(courier.estimated_delivery_days);
  if (fromEstimatedDays) return fromEstimatedDays;

  if (courier.etd) {
    const fromDaysField = parseNumericRange(courier.etd);
    if (fromDaysField) return fromDaysField;

    const fromEtdDate = daysUntilDate(courier.etd);
    if (fromEtdDate) return { min: fromEtdDate, max: fromEtdDate };
  }

  if (courier.edd) {
    const fromEddDate = daysUntilDate(courier.edd);
    if (fromEddDate) return { min: fromEddDate, max: fromEddDate };
  }

  const fromHours = daysFromHours(courier.etd_hours);
  if (fromHours) return { min: fromHours, max: fromHours };

  return null;
}

export function getActiveCouriers(
  couriers: ShiprocketCourierCompany[]
): ShiprocketCourierCompany[] {
  const active = couriers.filter((courier) => courier.blocked !== 1);
  return active.length > 0 ? active : couriers;
}

export function pickCourierId(
  couriers: ShiprocketCourierCompany[]
): number | null {
  const active = getActiveCouriers(couriers);
  for (const courier of active) {
    if (courier.courier_company_id) return courier.courier_company_id;
  }
  return null;
}

export function parseCourierTransitDays(
  couriers: ShiprocketCourierCompany[]
): { min: number; max: number } | null {
  const usable = getActiveCouriers(couriers);
  if (!usable.length) return null;

  const ranges = usable
    .map(getCourierTransit)
    .filter((range): range is { min: number; max: number } => range != null);

  if (!ranges.length) {
    return {
      min: DEFAULT_TRANSIT_DAYS.MIN,
      max: DEFAULT_TRANSIT_DAYS.MAX,
    };
  }

  return {
    min: Math.min(...ranges.map((range) => range.min)),
    max: Math.max(...ranges.map((range) => range.max)),
  };
}
