export interface DeliveryEstimateResult {
  pincode: string;
  serviceable: boolean;
  transitDaysMin: number;
  transitDaysMax: number;
  preparationDaysMin: number;
  preparationDaysMax: number;
  estimatedDeliveryDate: string;
  formattedDate: string;
  courierCount: number;
}
