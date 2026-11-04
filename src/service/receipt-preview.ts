import axiosApi from "@/lib/axios";
import {
  PaymentReceiptPreviewResponse,
  ReceiptPreviewPayload,
  ReceiptPreviewResponse,
} from "@/models/receipt-preview-model";

export const RECEIPT_PREVIEW_ENDPOINT = `/receipts/config/preview`;

export const previewReceipt = async (
  payload: ReceiptPreviewPayload
): Promise<ReceiptPreviewResponse> => {
  const response = await axiosApi.post(RECEIPT_PREVIEW_ENDPOINT, payload);
  return response.data;
};


export const getPaymentReceiptPreview = async (
  paymentId: number
): Promise<PaymentReceiptPreviewResponse> => {
  const response = await axiosApi.get(`/receipts/${paymentId}/preview`);
  return response.data;
};