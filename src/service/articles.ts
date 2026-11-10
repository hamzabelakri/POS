import axiosApi from "@/lib/axios";
import {
  CreateTransactionPayload,
  CreateTransactionResponse,
} from "@/models/articles-model";

export const TRANSACTIONS_ENDPOINT = `/transactions`;

export const createTransaction = async (
  payload: CreateTransactionPayload
): Promise<CreateTransactionResponse> => {
  const response = await axiosApi.post(TRANSACTIONS_ENDPOINT, payload);
  return response.data;
};