import axiosApi from "@/lib/axios";
import {
  LostTicketTransactionPayload,
  LostTicketTransactionResponse,
} from "@/models/articles-model";

export const TRANSACTIONS_ENDPOINT = `/transactions`;

export const createLostTicketTransaction = async (
  payload: LostTicketTransactionPayload
): Promise<LostTicketTransactionResponse> => {
  const response = await axiosApi.post(TRANSACTIONS_ENDPOINT, payload);
  return response.data;
};