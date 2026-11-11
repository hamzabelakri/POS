import type {
  MessageResponse,
  PaymentRequestPayload,
} from '@/models/payment-model'

// PUT /bridge/update-image: the latest exit_car, with its image and the cashier
export type UpdateImagePayload = PaymentRequestPayload
export type UpdateImageResponse = MessageResponse

// POST /bridge/capture
export type CaptureResponse = {
  image: string
  lpn_q: number
  media: { lpn: string }
  image_id: string
}