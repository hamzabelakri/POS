import axiosApi from "@/lib/axios";
import { BucketData, CalculateTariffPayload } from "@/models/bucket-model";

export const CALCULATE_TARIFF_ENDPOINT = "/payments/calculate-tariff";
export const CANCEL_PAYMENT_ENDPOINT = "/payments/cancel";

// POST /payments/calculate-tariff
export const calculateTariff = async (
  payload: CalculateTariffPayload,
): Promise<BucketData> => {
  const response = await axiosApi.post(CALCULATE_TARIFF_ENDPOINT, payload);
  return response.data;
};

// POST /payments/cancel?print_receipt=false (always false for a cancellation)
export const cancelPayment = async (bucket: BucketData): Promise<void> => {
  await axiosApi.post(CANCEL_PAYMENT_ENDPOINT, bucket, {
    params: { print_receipt: false },
  });
};