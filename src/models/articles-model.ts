import type { PaymentRequestPayload, MessageResponse } from '@/models/payment-model'
import { PmsArticleDefinition } from '@/models/pos-config-model'

export const SEASON_PARKER_CODE = 'SEASON_PARKER'
export const LOST_TICKET_WITH_CALCULATION_CODE = 'LOST_TICKET_WITH_CALCULATION'
export const SHORT_TERM_PARKER_CODE = 'SHORT_TERM_PARKER'

export type Article = {
  id: number
  code: string
  name: string // raw translated name; '' when no translation has one
  title: string // display label (current language): name, or the code when name is empty
  description?: string // resolved from translations (current language)
  iconUrl?: string
  amount: number
  isProduction: boolean
  isActive: boolean
  isDiscount: boolean
  discountType: string
  discountValue: number
  checkPms: boolean
  permissionRequired: boolean
  pmsArticleDefinition: PmsArticleDefinition
  createdAt: string
  updatedAt: string
}

// One row in the billing list, built from an exit_car transaction.
// `key` is the transaction key ("1", "2", ...).
export type BillingLine = { key: string; article: Article }

// POST /transactions: same body as every other request (the exit_car shape)
// { status: 200, message: "Transaction added successfully" }
export type CreateTransactionPayload = PaymentRequestPayload
export type CreateTransactionResponse = MessageResponse