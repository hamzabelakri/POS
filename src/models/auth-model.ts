import { ApiResponse } from "./api";

export interface LoginPayload {
  username: string;
  password: string;
}

// POST /auth/logout closes the shift.
export interface LogoutPayload {
  shift_id: number;
}

export interface LoginData {
  token: string;
  has_open_shift: boolean;
}

export type LoginResponse = ApiResponse<LoginData>;