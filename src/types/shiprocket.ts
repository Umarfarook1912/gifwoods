export interface ShiprocketTokenResponse {
  token: string;
  email: string;
}

export interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
}

export interface ShiprocketOrderPayload {
  order_id: string;
  order_date: string;
  pickup_location: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_phone: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_country: string;
  billing_pincode: string;
  shipping_is_billing: boolean;
  order_items: ShiprocketOrderItem[];
  payment_method: "Prepaid";
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

export interface ShiprocketOrderResponse {
  order_id: number;
  shipment_id: number;
  status: string;
  awb_assign_status?: number;
}

export interface ShiprocketAWBResponse {
  awb_assign_status: number;
  response: {
    data: {
      awb_code: string;
      courier_name: string;
      courier_id: number;
    };
  };
}

export interface ShiprocketPickupResponse {
  pickup_status: number;
  response: {
    pickup_scheduled_date: string;
    pickup_token_number: string;
  };
}

export interface ShiprocketTrackingActivity {
  date: string;
  activity: string;
  location: string;
  sr_status?: string;
}

export interface ShiprocketTrackingResponse {
  tracking_data: {
    track_status: number;
    shipment_status: string;
    shipment_track: ShiprocketTrackingActivity[];
    shipment_track_activities: ShiprocketTrackingActivity[];
  };
}

export interface ShiprocketShipmentResult {
  shiprocket_order_id: string;
  shiprocket_shipment_id: string;
  awb_code: string;
  courier_name: string;
  tracking_url: string;
}

export interface ShiprocketCourierCompany {
  courier_company_id?: number;
  courier_name?: string;
  etd?: string;
  edd?: string;
  estimated_delivery_days?: string | number;
  etd_hours?: number;
  blocked?: number;
}

export interface ShiprocketServiceabilityResponse {
  data?: {
    available_courier_companies?: ShiprocketCourierCompany[];
  };
  status?: number;
  message?: string;
}

export interface ShiprocketOrderDetail {
  id?: number;
  channel_order_id?: string;
  awb_code?: string;
  courier_name?: string;
  status?: string;
  current_status?: string;
}
