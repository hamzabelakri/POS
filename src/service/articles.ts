import axiosApi from "@/lib/axios";
import {
  LostTicketCancelPayload,
  LostTicketCancelResponse,
  LostTicketTransactionPayload,
  LostTicketTransactionResponse,
} from "@/models/articles-model";

export const TRANSACTIONS_ENDPOINT = `/transactions`;
export const PAYMENT_CANCEL_ENDPOINT = `/payments/cancel`;

export const createLostTicketTransaction = async (
  payload: LostTicketTransactionPayload
): Promise<LostTicketTransactionResponse> => {
  const response = await axiosApi.post(TRANSACTIONS_ENDPOINT, payload);
  return response.data;
};

// print_receipt is always false for the lost ticket.
export const cancelLostTicketPayment = async (
  payload: LostTicketCancelPayload
): Promise<LostTicketCancelResponse> => {
  const response = await axiosApi.post(PAYMENT_CANCEL_ENDPOINT, payload, {
    params: { print_receipt: false },
  });
  return response.data;
};