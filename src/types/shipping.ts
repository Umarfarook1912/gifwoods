export type DeliveryMethod = "normal" | "fast";

export interface DeliveryOptionEstimate {
  method: DeliveryMethod;
  estimatedDeliveryDate: string;
  formattedDate: string;
  transitDays: number;
}

export interface DeliveryEstimateResult {
  pincode: string;
  serviceable: boolean;
  transitDaysMin: number;
  transitDaysMax: number;
  preparationDaysMin: number;
  preparationDaysMax: number;
  /** @deprecated Prefer options.normal — kept for older callers */
  estimatedDeliveryDate: string;
  /** @deprecated Prefer options.normal */
  formattedDate: string;
  courierCount: number;
  options: {
    normal: DeliveryOptionEstimate;
    fast: DeliveryOptionEstimate;
  };
}
