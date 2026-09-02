export interface OrderEmailLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderEmailPayload {
  orderId: string;
  customerName: string | null;
  customerEmail: string;
  items: OrderEmailLineItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentId?: string;
  estimatedDeliveryDate?: string | null;
}
