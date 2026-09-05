import { OrderStatus, OrderItem, ShippingAddress } from "./order";

export interface ChatOrderSummary {
  id: string;
  shortId: string;
  status: OrderStatus;
  totalAmount: number;
  itemsCount: number;
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
  createdAt: string;
  canCancel: boolean;
  cancellationReason?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  orderOptions?: ChatOrderSummary[];
  selectedOrder?: ChatOrderSummary;
  isActionable?: boolean;
}

export interface ChatApiResponse {
  success: boolean;
  authenticated: boolean;
  user?: {
    name: string;
    email: string;
  };
  reply?: string;
  welcomeMessage?: string;
  orders: ChatOrderSummary[];
  messages?: ChatMessage[];
  error?: string;
}

export interface ChatConversation {
  _id?: string;
  userId: string;
  userEmail: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
