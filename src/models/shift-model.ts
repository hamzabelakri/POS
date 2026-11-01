import { ApiResponse } from "./api";

export interface StartShiftPayload {
  start_amount: number;
}

export interface Shift {
  id: number;
  timestamp_id: string;
  cashier_id: number;
  cashier_name: string;
  pos_id: number;
  external_system_sync: boolean;
  start_amount: number;
  current_amount: number;
  end_amount: number;
  start_time: string;
  end_time: string;
  external_system_details: Record<string, unknown>;
  status: string; // "open" | "closed"
}

export interface StartShiftData {
  shift: Shift;
}

export type StartShiftResponse = ApiResponse<StartShiftData>;

// PATCH /shifts/current closes the cashier's open shift (identified by the token).
export interface CloseCurrentShiftData {
  user_id: number;
}

export type CloseCurrentShiftResponse = ApiResponse<CloseCurrentShiftData>;

// GET /shifts/current returns the cashier's open shift.
export type CurrentShiftResponse = ApiResponse<StartShiftData>;