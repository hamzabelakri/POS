import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { previewReceipt, printLastReceipt } from "@/service/printer"
import {
  PrintReceiptResponse,
  ReceiptPreviewPayload,
  ReceiptPreviewResponse,
} from "@/models/printer-model"
import { ApiError } from "@/models/api"
import { AlertEnum } from "@/models/alert-model"
import { useAlertStore } from "@/stores/alert-store"

export const RECEIPT_PREVIEW_KEY = ["receipt-preview"] as const

export function usePrintLastReceipt() {
  const { showAlert } = useAlertStore()

  return useMutation<PrintReceiptResponse, AxiosError<ApiError>, number>({
    mutationFn: printLastReceipt,
    onSuccess: (data) => {
      showAlert({ message: data.message, type: AlertEnum.SUCCESS })
    },
    onError: (error) => {
      console.error("Print last receipt failed: ", error?.response?.data?.error)
      showAlert({
        message:
          error?.response?.data?.error ||
          "Unable to print the last receipt. Please try again.",
        type: AlertEnum.ERROR,
      })
    },
  })
}

// Fires the request and drops the image into the query cache, so any
// component (e.g. the Receipt tab) can read it without prop drilling.
export function useReceiptPreview() {
  const queryClient = useQueryClient()
  const { showAlert } = useAlertStore()

  return useMutation<
    ReceiptPreviewResponse,
    AxiosError<ApiError>,
    ReceiptPreviewPayload
  >({
    mutationFn: previewReceipt,
    onSuccess: (res) => {
      queryClient.setQueryData(RECEIPT_PREVIEW_KEY, res.data.image_base64)
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

// Read-only view of the cached preview (never fetches by itself).
export function useReceiptPreviewImage() {
  return useQuery<string>({
    queryKey: RECEIPT_PREVIEW_KEY,
    queryFn: skipToken,
  })
}