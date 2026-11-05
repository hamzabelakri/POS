import axiosApi from "@/lib/axios"
import {
  ConfigReceiptPreviewPayload,
  PrintReceiptResponse,
  ReceiptPreviewResponse,
} from "@/models/printer-model"

export const PRINTER_ENDPOINT = `/printer`
export const RECEIPTS_ENDPOINT = `/receipts`

export const printLastReceipt = async (
  shiftId: number
): Promise<PrintReceiptResponse> => {
  const response = await axiosApi.post(
    `${PRINTER_ENDPOINT}/receipt/last/${shiftId}`
  )
  return response.data
}

export const previewConfigReceipt = async (
  payload: ConfigReceiptPreviewPayload
): Promise<ReceiptPreviewResponse> => {
  const response = await axiosApi.post(
    `${RECEIPTS_ENDPOINT}/config/preview`,
    payload
  )
  return response.data
}

export const previewPaymentReceipt = async (
  paymentId: number
): Promise<ReceiptPreviewResponse> => {
  const response = await axiosApi.get(
    `${RECEIPTS_ENDPOINT}/${paymentId}/preview`
  )
  return response.data
}

export const printReceipt = async (
  paymentId: number
): Promise<PrintReceiptResponse> => {
  const response = await axiosApi.post(
    `${PRINTER_ENDPOINT}/receipt/${paymentId}`
  )
  return response.data
}