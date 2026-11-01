import { useMutation } from "@tanstack/react-query";
import { login, logout } from "@/service/auth";
import {
  LoginResponse,
  LoginPayload,
  LogoutPayload,
} from "@/models/auth-model";
import { ApiError } from "@/models/api";
import { AxiosError } from "axios";
import { AlertEnum } from "@/models/alert-model";
import { useAuthStore } from "@/stores/auth-store";
import { useAlertStore } from "@/stores/alert-store";
import { useRouter } from "@tanstack/react-router";

// Navigation stays with the sign-in page: the next screen depends on
// `has_open_shift`, and on the existing-shift choice.
export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const { showAlert } = useAlertStore();

  return useMutation<LoginResponse, AxiosError<ApiError>, LoginPayload>({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data);
    },
    onError: (error) => {
      console.error("Login failed: ", error?.response?.data?.error);
      showAlert({
        message: error?.response?.data?.error || "Login failed. Please try again.",
        type: AlertEnum.ERROR,
      });
    },
  });
}

// POST /auth/logout { shift_id } closes the shift, ends the local session and
// goes back to the sign-in page.
export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { showAlert } = useAlertStore();

  return useMutation<void, AxiosError<ApiError>, LogoutPayload>({
    mutationFn: logout,
    onSuccess: () => {
      clearAuth();
      router.navigate({ to: "/sign-in" });
    },
    onError: (error) => {
      console.error("Close shift failed: ", error?.response?.data?.error);
      showAlert({
        message: error?.response?.data?.error || "Unable to close the shift. Please try again.",
        type: AlertEnum.ERROR,
      });
    },
  });
}