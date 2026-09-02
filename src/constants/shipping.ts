export const DELIVERY_DAYS = {
  STANDARD_MIN: 5,
  STANDARD_MAX: 7,
  PERSONALIZED_MIN: 7,
  PERSONALIZED_MAX: 10,
} as const;

export const DEFAULT_SHIPMENT_WEIGHT_KG = 1;

export const DEFAULT_TRANSIT_DAYS = {
  MIN: 3,
  MAX: 5,
} as const;

export const DELIVERY_COPY = {
  EXPECTED_DELIVERY_BY: "Expected delivery by",
  PINCODE_LABEL: "Delivery pincode",
  PINCODE_PLACEHOLDER: "Enter 6-digit pincode",
  CHECK_DELIVERY: "Check delivery date",
  CHECKING: "Checking delivery…",
  ENTER_PINCODE: "Enter your pincode to see the estimated delivery date from Shiprocket.",
  NOT_SERVICEABLE:
    "Delivery is not available for this pincode right now. Please try another pincode.",
  SHIPROCKET_SOURCE: "Estimate includes crafting time + courier transit via Shiprocket.",
  INVALID_PINCODE: "Enter a valid 6-digit pincode",
} as const;
