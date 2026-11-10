import type { ApiResponse } from '@/models/api'
import type { ExitCar } from '@/models/sse-model'

// Responses we don't read in the UI: only status and message (no data).
export type MessageResponse = Omit<ApiResponse<unknown>, 'data'>

export type Cashier = ExitCar['cashier']
export type AppliedArticle = ExitCar['applied_article']

export type PaymentMethodType = 'cash' | 'card'

// Every payment request sends the same body: the exit_car shape.
export type PaymentRequestPayload = ExitCar

// POST /payments/calculate-tariff (lost ticket with calculation)
// { status: 200, message: "Tariff calculated successfully" }
export type CalculateTariffPayload = PaymentRequestPayload
export type CalculateTariffResponse = MessageResponse
export type CalculateTariffValues = { lpn: string; entryTime: Date }

// POST /payments/cancel?print_receipt=false
// { status: 200, message: "Payment cancelled successfully" }
export type CancelPayload = PaymentRequestPayload
export type CancelResponse = MessageResponse

// POST /payments/cash | /payments/card?print_receipt=<Auto Print>
export type PaymentPayload = PaymentRequestPayload
export type PaymentResponse = MessageResponse

export type PayVariables = {
  method: PaymentMethodType
  payload: PaymentPayload
  printReceipt: boolean
}