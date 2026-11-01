import axiosApi from "@/lib/axios";
import {
  CloseCurrentShiftResponse,
  CurrentShiftResponse,
  StartShiftPayload,
  StartShiftResponse,
} from "@/models/shift-model";

export const SHIFTS_ENDPOINT = `/shifts`;
export const CURRENT_SHIFT_ENDPOINT = `/shifts/current`;

export const startShift = async (
  payload: StartShiftPayload
): Promise<StartShiftResponse> => {
  const response = await axiosApi.post(SHIFTS_ENDPOINT, payload);
  return response.data;
};

// The logged-in cashier's open shift (the token identifies the cashier).
export const getCurrentShift = async (): Promise<CurrentShiftResponse> => {
  const response = await axiosApi.get(CURRENT_SHIFT_ENDPOINT);
  return response.data;
};

// Closes the logged-in cashier's open shift; no shift id needed.
export const closeCurrentShift = async (): Promise<CloseCurrentShiftResponse> => {
  const response = await axiosApi.patch(CURRENT_SHIFT_ENDPOINT);
  return response.data;
};