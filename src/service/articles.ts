import {
  LostTicketCancelPayload,
  LostTicketCancelResponse,
  LostTicketTransactionPayload,
  LostTicketTransactionResponse,
  LostTicketWithCalculationPayload,
  LostTicketWithCalculationResponse,
} from '@/models/articles-model'
import axiosApi from '@/lib/axios'

export const TRANSACTIONS_ENDPOINT = `/transactions`
export const PAYMENT_CANCEL_ENDPOINT = `/payments/cancel`

export const createLostTicketTransaction = async (
  payload: LostTicketTransactionPayload
): Promise<LostTicketTransactionResponse> => {
  const response = await axiosApi.post(TRANSACTIONS_ENDPOINT, payload)
  return response.data
}

// print_receipt is always false for the lost ticket.
export const cancelLostTicketPayment = async (
  payload: LostTicketCancelPayload
): Promise<LostTicketCancelResponse> => {
  const response = await axiosApi.post(PAYMENT_CANCEL_ENDPOINT, payload, {
    params: { print_receipt: false },
  })
  return response.data
}

export const CALCULATE_TARIFF_ENDPOINT = `/payments/calculate-tariff`

export const calculateLostTicketTariff = async (
  payload: LostTicketWithCalculationPayload
): Promise<LostTicketWithCalculationResponse> => {
  const response = await axiosApi.post(CALCULATE_TARIFF_ENDPOINT, payload)
  return response.data
}
