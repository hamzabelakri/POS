import { ApiResponse } from "./api";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LogoutPayload {
  shift_id: number;
}

export interface Cashier {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  contract_id: string;
  consumer_id: string;
  is_active: boolean;
  permission_required: boolean;
  barrier_control_allowed_without_permission: boolean;
  shift_report_allowed_without_permission: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
}

export interface LoginData {
  token: string;
  has_open_shift: boolean;
  cashier: Cashier;
}

export type LoginResponse = ApiResponse<LoginData>;