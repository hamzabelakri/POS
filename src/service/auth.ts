import axiosApi from "@/lib/axios";
import { LoginPayload, LogoutPayload, LoginResponse } from "@/models/auth-model";

export const LOGIN_ENDPOINT = `/auth/login`;
export const LOGOUT_ENDPOINT = `/auth/logout`;

export const login = async (loginData: LoginPayload): Promise<LoginResponse> => {
  const response = await axiosApi.post(LOGIN_ENDPOINT, loginData);
  return response.data;
};

// Closes the shift identified by `shift_id`.
export const logout = async (logoutData: LogoutPayload): Promise<void> => {
  await axiosApi.post(LOGOUT_ENDPOINT, logoutData);
};