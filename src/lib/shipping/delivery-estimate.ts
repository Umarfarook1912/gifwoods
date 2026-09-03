import {
  DELIVERY_DAYS,
  DEFAULT_SHIPMENT_WEIGHT_KG,
  MIN_FAST_NORMAL_GAP_DAYS,
} from "@/constants/shipping";
import { formatDate } from "@/lib/utils/formatters";
import { needsCustomization } from "@/lib/customization";
import { checkCourierServiceability } from "@/lib/shiprocket/client";
import { parseCourierTransitDays, getActiveCouriers } from "@/lib/shipping/parse-serviceability";
import type { Product } from "@/types/product";
import type { DeliveryEstimateResult, DeliveryOptionEstimate } from "@/types/shipping";

function addCalendarDays(from: Date, days: number): Date {
  const result = new Date(from);
  result.setDate(result.getDate() + days);
  return result;
}

function getPreparationDays(
  product: Pick<Product, "customization_text" | "customization_image">
): { min: number; max: number } {
  const personalized = needsCustomization(product);
  return personalized
    ? {
        min: DELIVERY_DAYS.PERSONALIZED_MIN,
        max: DELIVERY_DAYS.PERSONALIZED_MAX,
      }
    : {
        min: DELIVERY_DAYS.STANDARD_MIN,
        max: DELIVERY_DAYS.STANDARD_MAX,
      };
}

function buildOption(
  method: "normal" | "fast",
  prepMid: number,
  transitDays: number
): DeliveryOptionEstimate {
  const totalDays = prepMid + transitDays;
  const deliveryDate = addCalendarDays(new Date(), totalDays);
  return {
    method,
    transitDays,
    estimatedDeliveryDate: deliveryDate.toISOString(),
    formattedDate: formatDate(deliveryDate.toISOString()),
  };
}

/**
 * Builds Normal and Fast estimates.
 * Fast = quickest courier transit. Normal = slower courier transit, padded so
 * the shown dates are at least MIN_FAST_NORMAL_GAP_DAYS apart (always show Fast).
 */
export async function getShiprocketDeliveryEstimate(options: {
  pincode: string;
  product: Pick<Product, "customization_text" | "customization_image">;
  pickupPostcode: string;
  weightKg?: number;
  declaredValue: number;
}): Promise<DeliveryEstimateResult> {
  const preparation = getPreparationDays(options.product);
  const prepMid = Math.round((preparation.min + preparation.max) / 2);

  const serviceability = await checkCourierServiceability({
    pickupPostcode: options.pickupPostcode,
    deliveryPostcode: options.pincode,
    weightKg: options.weightKg ?? DEFAULT_SHIPMENT_WEIGHT_KG,
    declaredValue: options.declaredValue,
    cod: 0,
  });

  const couriers = getActiveCouriers(
    serviceability.data?.available_courier_companies ?? []
  );
  const transit = parseCourierTransitDays(couriers);

  if (!transit || couriers.length === 0) {
    console.warn("Shiprocket serviceability: no couriers", {
      pickup: options.pickupPostcode,
      delivery: options.pincode,
      message: serviceability.message,
    });
    return {
      pincode: options.pincode,
      serviceable: false,
      transitDaysMin: 0,
      transitDaysMax: 0,
      preparationDaysMin: preparation.min,
      preparationDaysMax: preparation.max,
      estimatedDeliveryDate: "",
      formattedDate: "",
      courierCount: 0,
      options: {
        normal: {
          method: "normal",
          transitDays: 0,
          estimatedDeliveryDate: "",
          formattedDate: "",
        },
        fast: {
          method: "fast",
          transitDays: 0,
          estimatedDeliveryDate: "",
          formattedDate: "",
        },
      },
    };
  }

  const fastTransit = transit.min;
  const normalTransit = Math.max(
    transit.max,
    fastTransit + MIN_FAST_NORMAL_GAP_DAYS
  );

  const fast = buildOption("fast", prepMid, fastTransit);
  const normal = buildOption("normal", prepMid, normalTransit);

  return {
    pincode: options.pincode,
    serviceable: true,
    transitDaysMin: fastTransit,
    transitDaysMax: normalTransit,
    preparationDaysMin: preparation.min,
    preparationDaysMax: preparation.max,
    estimatedDeliveryDate: normal.estimatedDeliveryDate,
    formattedDate: normal.formattedDate,
    courierCount: couriers.length,
    options: { normal, fast },
  };
}
