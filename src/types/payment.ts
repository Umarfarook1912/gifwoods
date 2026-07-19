export interface CashfreeOrderRequest {
  order_id: string;
  order_amount: number;
  order_currency: string;
  customer_details: {
    customer_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  };
  order_meta?: {
    return_url?: string;
    notify_url?: string;
  };
}

export interface CashfreeOrderResponse {
  cf_order_id: string;
  order_id: string;
  entity: string;
  order_currency: string;
  order_amount: number;
  order_status: string;
  payment_session_id: string;
  order_expiry_time: string;
}

export interface CashfreeOrderStatusResponse {
  order_id: string;
  order_status: "ACTIVE" | "PAID" | "EXPIRED" | "TERMINATED";
  order_amount: number;
  order_currency: string;
}

export interface CashfreePaymentResponse {
  cf_payment_id: string;
  payment_status: PaymentStatus;
}

export type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING" | "USER_DROPPED";

export interface CashfreeWebhookPayload {
  data: {
    order: {
      order_id: string;
      order_amount: number;
      order_currency: string;
    };
    payment: {
      cf_payment_id: string;
      payment_status: PaymentStatus;
      payment_amount: number;
      payment_currency: string;
      payment_message: string;
      payment_time: string;
    };
  };
  event_time: string;
  type: string;
}
