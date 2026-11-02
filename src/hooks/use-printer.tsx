import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { printLastReceipt } from "@/service/printer";
import { PrintReceiptResponse } from "@/models/printer-model";
import { ApiError } from "@/models/api";
import { AlertEnum } from "@/models/alert-model";
import { useAlertStore } from "@/stores/alert-store";

export function usePrintLastReceipt() {
  const { showAlert } = useAlertStore();

  return useMutation<PrintReceiptResponse, AxiosError<ApiError>, number>({
    mutationFn: printLastReceipt,
    onSuccess: (data) => {
      showAlert({ message: data.message, type: AlertEnum.SUCCESS });
    },
    onError: (error) => {
      console.error("Print last receipt failed: ", error?.response?.data?.error);
      showAlert({
        message:
          error?.response?.data?.error ||
          "Unable to print the last receipt. Please try again.",
        type: AlertEnum.ERROR,
      });
    },
  });
}