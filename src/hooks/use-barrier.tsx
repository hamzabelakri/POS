import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  closeBarrier,
  lockBarrier,
  openBarrier,
  unlockBarrier,
} from "@/service/barrier";
import { BarrierResponse } from "@/models/barrier-model";
import { ApiError } from "@/models/api";
import { AlertEnum } from "@/models/alert-model";
import { useAlertStore } from "@/stores/alert-store";

// Shared by the four barrier hooks: they only differ by endpoint and fallback error.
function useBarrierMutation(
  mutationFn: () => Promise<BarrierResponse>,
  fallbackError: string
) {
  const { showAlert } = useAlertStore();

  return useMutation<BarrierResponse, AxiosError<ApiError>, void>({
    mutationFn,
    onSuccess: (data) => {
      showAlert({ message: data.message, type: AlertEnum.SUCCESS });
    },
    onError: (error) => {
      console.error(fallbackError, error?.response?.data?.error);
      showAlert({
        message: error?.response?.data?.error || fallbackError,
        type: AlertEnum.ERROR,
      });
    },
  });
}

export const useOpenBarrier = () =>
  useBarrierMutation(openBarrier, "Unable to open the barrier. Please try again.");

export const useCloseBarrier = () =>
  useBarrierMutation(closeBarrier, "Unable to close the barrier. Please try again.");

export const useLockBarrier = () =>
  useBarrierMutation(lockBarrier, "Unable to lock the barrier. Please try again.");

export const useUnlockBarrier = () =>
  useBarrierMutation(unlockBarrier, "Unable to unlock the barrier. Please try again.");