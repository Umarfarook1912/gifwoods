export const DELIVERY_DAYS = {
  /** Ready-to-ship / stock products */
  STANDARD_MIN: 1,
  STANDARD_MAX: 1,
  /** Personalized / engraved products need crafting time */
  PERSONALIZED_MIN: 2,
  PERSONALIZED_MAX: 4,
} as const;

export const DEFAULT_SHIPMENT_WEIGHT_KG = 1;

export const DEFAULT_TRANSIT_DAYS = {
  MIN: 3,
  MAX: 5,
} as const;

/** Extra fee when customer chooses Fast delivery (on top of standard shipping).
 *  App markup — not from Shiprocket courier rates. */
export const FAST_DELIVERY_FEE = 60;

/** Minimum calendar-day gap between Fast and Normal estimated dates. */
export const MIN_FAST_NORMAL_GAP_DAYS = 2;

export const DELIVERY_METHODS = {
  NORMAL: "normal",
  FAST: "fast",
} as const;

export const DELIVERY_COPY = {
  EXPECTED_DELIVERY_BY: "Expected delivery by",
  PINCODE_LABEL: "Delivery pincode",
  PINCODE_PLACEHOLDER: "Enter 6-digit pincode",
  CHECK_DELIVERY: "Check delivery date",
  CHECKING: "Checking delivery…",
  ENTER_PINCODE: "Enter your pincode to see Normal and Fast delivery dates.",
  NOT_SERVICEABLE:
    "Delivery is not available for this pincode right now. Please try another pincode.",
  ESTIMATE_FOOTNOTE:
    "Dates include packing time plus courier transit. Fast uses the quickest available courier.",
  INVALID_PINCODE: "Enter a valid 6-digit pincode",
  NORMAL_LABEL: "Normal delivery",
  FAST_LABEL: "Fast delivery",
  FAST_FEE_NOTE: `+₹${FAST_DELIVERY_FEE}`,
  FAST_FEE_HINT: `Extra ₹${FAST_DELIVERY_FEE} for quicker courier transit`,
  CHOOSE_METHOD: "Choose delivery speed",
  /** Prefix before the date, e.g. "Estimated delivery on or before 10 Sept 2026" */
  ESTIMATED_ON_OR_BEFORE: "Estimated delivery on or before",
} as const;

export const PRODUCT_DETAIL_COPY = {
  ADD_TO_CART: "Add to Cart",
  BUY_NOW: "Buy Now",
  OUT_OF_STOCK: "Out of Stock",
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
