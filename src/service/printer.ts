import axiosApi from "@/lib/axios"
import {
  PrintReceiptResponse,
  ReceiptPreviewPayload,
  ReceiptPreviewResponse,
} from "@/models/printer-model"

export const PRINTER_ENDPOINT = `/printer`
export const RECEIPT_PREVIEW_ENDPOINT = `/receipts/config/preview`

export const printLastReceipt = async (
  shiftId: number
): Promise<PrintReceiptResponse> => {
  const response = await axiosApi.post(
    `${PRINTER_ENDPOINT}/receipt/last/${shiftId}`
  )
  return response.data
}

export const previewReceipt = async (
  payload: ReceiptPreviewPayload
): Promise<ReceiptPreviewResponse> => {
  const response = await axiosApi.post(RECEIPT_PREVIEW_ENDPOINT, payload)
  return response.data
}