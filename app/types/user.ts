import { ObjectId } from "mongodb";

export type UserRole = "user" | "admin" | "test";

export interface User {
  _id?: string | ObjectId;
  name: string;
  email: string;
  username?: string;
  password_hash: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface UserSafe {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  createdAt: Date | string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: UserSafe;
}

export interface UserProfileResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: UserSafe;
  stats?: {
    totalOrders: number;
    activeOrders: number;
    completedOrders: number;
    cancelledOrders: number;
  };
}

