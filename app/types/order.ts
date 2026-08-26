import { ObjectId } from "mongodb";

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface OrderItem {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  _id?: string | ObjectId;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  cancellationReason?: string;
}

export interface CreateOrderInput {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}

export interface OrderResponse {
  success: boolean;
  message?: string;
  error?: string;
  order?: Order;
  orders?: Order[];
}
