import axiosApi from '@/lib/axios'
import { BucketData, CalculateTariffPayload } from '@/models/bucket-model'

// POST /payments/calculate-tariff
export const calculateTariff = async (
  payload: CalculateTariffPayload
): Promise<BucketData> =>
  (await axiosApi.post('/payments/calculate-tariff', payload))?.data

// POST /payments/cancel?print_receipt=false (always false for a cancellation)
export const cancelPayment = async (bucket: BucketData): Promise<void> => {
  await axiosApi.post('/payments/cancel', bucket, {
    params: { print_receipt: false },
  })
}