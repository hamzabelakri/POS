import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { closeCurrentShift, getCurrentShift, startShift } from "@/service/shift";
import {
  CloseCurrentShiftResponse,
  CurrentShiftResponse,
  StartShiftPayload,
  StartShiftResponse,
} from "@/models/shift-model";
import { ApiError } from "@/models/api";
import { AlertEnum } from "@/models/alert-model";
import { useAuthStore } from "@/stores/auth-store";
import { useAlertStore } from "@/stores/alert-store";

export function useStartShift() {
  const setShift = useAuthStore((state) => state.setShift);
  const { showAlert } = useAlertStore();

  return useMutation<StartShiftResponse, AxiosError<ApiError>, StartShiftPayload>({
    mutationFn: startShift,
    onSuccess: (data) => {
      setShift(data.data.shift);
    },
    onError: (error) => {
      console.error("Start shift failed: ", error?.response?.data?.error);
      showAlert({
        message:
          error?.response?.data?.error || "Unable to start the shift. Please try again.",
        type: AlertEnum.ERROR,
      });
    },
  });
}

// Loads the cashier's open shift (with its id) and stores it. Called right
// after login when `has_open_shift` is true. Used as a mutation only because
// it is triggered on demand from the login flow, not rendered as data.
export function useFetchCurrentShift() {
  const setShift = useAuthStore((state) => state.setShift);
  const { showAlert } = useAlertStore();

  return useMutation<CurrentShiftResponse, AxiosError<ApiError>, void>({
    mutationFn: getCurrentShift,
    onSuccess: (data) => {
      setShift(data.data.shift);
    },
    onError: (error) => {
      // 404 "shift not found" only means there is no open shift: the caller handles it.
      if (error?.response?.status === 404) return;

      console.error("Load current shift failed: ", error?.response?.data?.error);
      showAlert({
        message:
          error?.response?.data?.error || "Unable to load the current shift. Please try again.",
        type: AlertEnum.ERROR,
      });
    },
  });
}

// Closes the cashier's currently open shift. The session (token) is kept, so
// the caller can go straight to "start shift".
export function useCloseCurrentShift() {
  const setShift = useAuthStore((state) => state.setShift);
  const { showAlert } = useAlertStore();

  return useMutation<CloseCurrentShiftResponse, AxiosError<ApiError>, void>({
    mutationFn: closeCurrentShift,
    onSuccess: () => {
      setShift(null);
    },
    onError: (error) => {
      console.error("Close current shift failed: ", error?.response?.data?.error);
      showAlert({
        message:
          error?.response?.data?.error || "Unable to close the current shift. Please try again.",
        type: AlertEnum.ERROR,
      });
    },
  });
}