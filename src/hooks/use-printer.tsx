import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import {
  previewConfigReceipt,
  previewPaymentReceipt,
  printLastReceipt,
  printReceipt,
} from "@/service/printer"
import {
  ConfigReceiptPreviewPayload,
  PrintReceiptResponse,
  ReceiptPreviewResponse,
} from "@/models/printer-model"
import { ApiError } from "@/models/api"
import { AlertEnum } from "@/models/alert-model"
import { useAlertStore } from "@/stores/alert-store"

export const CONFIG_RECEIPT_PREVIEW_KEY = ["config-receipt-preview"] as const

// Shared success/error alerts for every print mutation
function usePrintAlerts(fallbackError: string) {
  const { showAlert } = useAlertStore()
  return {
    onSuccess: (data: PrintReceiptResponse) => {
      showAlert({ message: data.message, type: AlertEnum.SUCCESS })
    },
    onError: (error: AxiosError<ApiError>) => {
      console.error("Print failed: ", error?.response?.data?.error)
      showAlert({
        message: error?.response?.data?.error || fallbackError,
        type: AlertEnum.ERROR,
      })
    },
  }
}

// Reprint a specific payment's receipt
export function usePrintReceipt() {
  return useMutation<PrintReceiptResponse, AxiosError<ApiError>, number>({
    mutationFn: printReceipt,
    ...usePrintAlerts("Unable to print the receipt. Please try again."),
  })
}

// Receipt image of a stored payment (used by the shift report modal)
export function usePaymentReceiptPreview(paymentId: number, enabled = true) {
  return useQuery({
    queryKey: ["payment-receipt-preview", paymentId],
    queryFn: () => previewPaymentReceipt(paymentId),
    select: (res) => res.data.image_base64,
    enabled,
    staleTime: Infinity, // a stored receipt never changes
  })
}

export function usePrintLastReceipt() {
  return useMutation<PrintReceiptResponse, AxiosError<ApiError>, number>({
    mutationFn: printLastReceipt,
    ...usePrintAlerts("Unable to print the last receipt. Please try again."),
  })
}

// Config receipt preview (template/config-driven, re-generatable)
export function useConfigReceiptPreview() {
  const queryClient = useQueryClient()
  const { showAlert } = useAlertStore()

  return useMutation<
    ReceiptPreviewResponse,
    AxiosError<ApiError>,
    ConfigReceiptPreviewPayload
  >({
    mutationFn: previewConfigReceipt,
    onSuccess: (res) => {
      queryClient.setQueryData(
        CONFIG_RECEIPT_PREVIEW_KEY,
        res.data.image_base64
      )
    },
    onError: (error) => {
      showAlert({
        message:
          error?.response?.data?.error || "Unable to load the receipt preview.",
        type: AlertEnum.ERROR,
      })
    },
  })
}

// Read-only view of the cached config preview (never fetches by itself).
export function useConfigReceiptPreviewImage() {
  return useQuery<string>({
    queryKey: CONFIG_RECEIPT_PREVIEW_KEY,
    queryFn: skipToken,
  })
}