import axiosApi from "@/lib/axios";
import type {
  CalculateTariffPayload,
  CalculateTariffResponse,
  CancelPayload,
  CancelResponse,
  PaymentMethodType,
  PaymentResponse,
  PayVariables,
} from "@/models/payment-model";

export const CALCULATE_TARIFF_ENDPOINT = `/payments/calculate-tariff`;
export const PAYMENT_CANCEL_ENDPOINT = `/payments/cancel`;

export const PAYMENT_ENDPOINTS: Record<PaymentMethodType, string> = {
  cash: `/payments/cash`,
  card: `/payments/card`,
};

export const calculateTariff = async (
  payload: CalculateTariffPayload
): Promise<CalculateTariffResponse> => {
  const response = await axiosApi.post(CALCULATE_TARIFF_ENDPOINT, payload);
  return response.data;
};

// print_receipt is always false when cancelling.
export const cancelPayment = async (
  payload: CancelPayload
): Promise<CancelResponse> => {
  const response = await axiosApi.post(PAYMENT_CANCEL_ENDPOINT, payload, {
    params: { print_receipt: false },
  });
  return response.data;
};

export const payOrder = async ({
  method,
  payload,
  printReceipt,
}: PayVariables): Promise<PaymentResponse> => {
  const response = await axiosApi.post(PAYMENT_ENDPOINTS[method], payload, {
    params: { print_receipt: printReceipt },
  });
  return response.data;
};