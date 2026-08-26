import { Order, OrderStatus } from "./order";
import { Product } from "./product";
import { UserSafe } from "./user";

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalProducts: number;
  totalUsers: number;
}

export interface AdminUpdateOrderStatusInput {
  status: OrderStatus;
  note?: string;
}

export interface CreateProductInput {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: {
    rate: number;
    count: number;
  };
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id?: number;
}

export interface AdminOrdersResponse {
  success: boolean;
  message?: string;
  error?: string;
  orders?: Order[];
}

export interface AdminProductsResponse {
  success: boolean;
  message?: string;
  error?: string;
  products?: Product[];
}

export interface AdminUsersResponse {
  success: boolean;
  message?: string;
  error?: string;
  users?: UserSafe[];
}
