import { DELIVERY_DAYS, DEFAULT_SHIPMENT_WEIGHT_KG } from "@/constants/shipping";
import { formatDate } from "@/lib/utils/formatters";
import { needsCustomization } from "@/lib/customization";
import { checkCourierServiceability } from "@/lib/shiprocket/client";
import { parseCourierTransitDays, getActiveCouriers } from "@/lib/shipping/parse-serviceability";
import type { Product } from "@/types/product";
import type { DeliveryEstimateResult } from "@/types/shipping";

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

export async function getShiprocketDeliveryEstimate(options: {
  pincode: string;
  product: Pick<Product, "customization_text" | "customization_image">;
  pickupPostcode: string;
  weightKg?: number;
  declaredValue: number;
}): Promise<DeliveryEstimateResult> {
  const preparation = getPreparationDays(options.product);
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
    };
  }

  const totalMin = preparation.min + transit.min;
  const totalMax = preparation.max + transit.max;
  const totalDays = Math.round((totalMin + totalMax) / 2);
  const deliveryDate = addCalendarDays(new Date(), totalDays);

  return {
    pincode: options.pincode,
    serviceable: true,
    transitDaysMin: transit.min,
    transitDaysMax: transit.max,
    preparationDaysMin: preparation.min,
    preparationDaysMax: preparation.max,
    estimatedDeliveryDate: deliveryDate.toISOString(),
    formattedDate: formatDate(deliveryDate.toISOString()),
    courierCount: couriers.length,
  };
}
