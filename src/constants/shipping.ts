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

/** Minimum calendar-day gap between Fast and Normal estimated dates. */
export const MIN_FAST_NORMAL_GAP_DAYS = 2;

/** Admin product form labels for per-product shipping charges. */
export const PRODUCT_SHIPPING_FIELDS = {
  SHIPPING_CHARGE_LABEL: "Shipping charge (₹)",
  FAST_SHIPPING_CHARGE_LABEL: "Fast surcharge (₹)",
  FAST_SHIPPING_HINT: "Added on top of shipping charge when Fast is selected",
} as const;

export const DELIVERY_METHODS = {
  NORMAL: "normal",
  FAST: "fast",
} as const;

export const DELIVERY_COPY = {
  EXPECTED_DELIVERY_BY: "Expected delivery by",
  DELIVERED_ON: "Delivered on",
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
  FAST_FEE_HINT: "Extra charge for quicker courier transit",
  CHOOSE_METHOD: "Choose delivery speed",
  SHIPPING_INCL_FAST: "Shipping (incl. Fast)",
  SHIPPING_LABEL: "Shipping",
  INCLUDES_FAST_SURCHARGE: "Includes Fast surcharge of",
  PER_PRODUCT_SHIPPING_NOTE:
    "Shipping is calculated from each product’s shipping charge. Fast adds that product’s Fast surcharge.",
  /** Prefix before the date, e.g. "Estimated delivery on or before 10 Sept 2026" */
  ESTIMATED_ON_OR_BEFORE: "Estimated delivery on or before",
} as const;

export const PRODUCT_DETAIL_COPY = {
  ADD_TO_CART: "Add to Cart",
  BUY_NOW: "Buy Now",
  OUT_OF_STOCK: "Out of Stock",
  TRUST_SHIPPING: "Per-product shipping · Insured delivery",
  TRUST_PAYMENT: "Secure payment · Easy returns",
} as const;

export const SHIPROCKET_MOCK = {
  AWB_PREFIX: "MOCK-AWB-",
  LEGACY_TEST_PREFIX: "TEST",
  COURIER_NAME: "Mock Courier (Dev)",
  /** Public page that pre-fills AWB — not shipment-tracking/?id= */
  TRACKING_BASE_URL: "https://shiprocket.co/tracking/",
} as const;

export const TRACKING_COPY = {
  TRACK_YOUR_ORDER: "Track your order",
  MOCK_NOTE: "Dev mock shipment — tracking events are simulated.",
  NO_EVENTS_YET: "No tracking events yet. Check back after pickup.",
  LOADING: "Loading tracking events…",
  UNAVAILABLE: "Live tracking unavailable right now.",
  SHIPMENT_TRACKING: "Shipment Tracking",
  AWB_LABEL: "AWB",
} as const;

/** Shiprocket often returns this when location is unknown — hide from UI. */
export const TRACKING_EMPTY_LOCATIONS = new Set(["na", "n/a", "null", "-", "none"]);

export const MANUAL_AWB_COPY = {
  TITLE: "Enter AWB manually",
  DESCRIPTION: "Paste the AWB from Shiprocket after Ship Now. Tracking will show for the customer immediately.",
  AWB_LABEL: "AWB / tracking number",
  AWB_PLACEHOLDER: "e.g. 123456789012",
  COURIER_LABEL: "Courier name (optional)",
  COURIER_PLACEHOLDER: "e.g. Delhivery",
  SAVE: "Save AWB",
  SAVING: "Saving…",
  SUCCESS: "AWB saved — customer can track this order",
  OPEN_DIALOG: "Enter AWB manually",
} as const;

export const SHIPROCKET_ERRORS = {
  WALLET_RECHARGE:
    "Please recharge your Shiprocket wallet. A minimum balance of ₹100 is required to assign AWB.",
  AWB_GENERIC: "Could not assign AWB for this shipment. Please try again later.",
  PUSH_FAILED: "Could not push this order to Shiprocket. Please try again.",
} as const;
