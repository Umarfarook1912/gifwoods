import type { Product, Customization } from "./product";
import type { DeliveryMethod } from "./shipping";

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  customization: Customization | null;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  shippingMethod: DeliveryMethod;
  setShippingMethod: (method: DeliveryMethod) => void;
  addItem: (product: Product, quantity?: number, customization?: Customization) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}
