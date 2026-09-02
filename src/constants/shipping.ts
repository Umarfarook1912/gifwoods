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

export const SHIPROCKET_MOCK = {
  AWB_PREFIX: "MOCK-AWB-",
  LEGACY_TEST_PREFIX: "TEST",
  COURIER_NAME: "Mock Courier (Dev)",
  TRACKING_BASE_URL: "https://www.shiprocket.in/shipment-tracking/?id=",
} as const;

export const TRACKING_COPY = {
  TRACK_YOUR_ORDER: "Track your order",
  MOCK_NOTE: "Dev mock shipment — tracking events are simulated.",
  NO_EVENTS_YET: "No tracking events yet. Check back after pickup.",
  LOADING: "Loading tracking events…",
  UNAVAILABLE: "Live tracking unavailable right now.",
  SHIPMENT_TRACKING: "Shipment Tracking",
} as const;

export const SHIPROCKET_ERRORS = {
  WALLET_RECHARGE:
    "Please recharge your Shiprocket wallet. A minimum balance of ₹100 is required to assign AWB.",
  AWB_GENERIC: "Could not assign AWB for this shipment. Please try again later.",
  PUSH_FAILED: "Could not push this order to Shiprocket. Please try again.",
} as const;
