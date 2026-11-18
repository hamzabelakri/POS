import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  closeBarrier,
  lockBarrier,
  openBarrier,
  retryOpenBarrier,
  unlockBarrier,
} from "@/service/barrier";
import { BarrierResponse } from "@/models/barrier-model";
import { ApiError } from "@/models/api";
import { AlertEnum } from "@/models/alert-model";
import { useAlertStore } from "@/stores/alert-store";

interface MutationOptions {
  showErrorAlert?: boolean;
}

function useBarrierMutation(
  mutationFn: () => Promise<BarrierResponse>,
  options: MutationOptions = {}
) {
  const { showAlert } = useAlertStore();
  const { showErrorAlert = true } = options;

  return useMutation<BarrierResponse, AxiosError<ApiError>, void>({
    mutationFn,
    onSuccess: (data) => {
      showAlert({ message: data.message, type: AlertEnum.SUCCESS });
    },
    onError: (error) => {
      console.error("Barrier mutation error:", error);

      const errorMessage = error?.response?.data?.error;
      if (showErrorAlert && errorMessage) {
        showAlert({
          message: errorMessage,
          type: AlertEnum.ERROR,
        });
      }
    },
  });
}

export const useOpenBarrier = () => useBarrierMutation(openBarrier);

export const useCloseBarrier = () => useBarrierMutation(closeBarrier);

export const useLockBarrier = () => useBarrierMutation(lockBarrier);

export const useUnlockBarrier = () => useBarrierMutation(unlockBarrier);

export const useRetryOpenBarrier = () =>
  useBarrierMutation(retryOpenBarrier, { showErrorAlert: false });