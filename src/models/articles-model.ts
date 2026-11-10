import { PmsArticleDefinition } from '@/models/pos-config-model'
import type { Cashier, MessageResponse } from '@/models/payment-model'

export const LOST_TICKET_CODE = 'LOST_TICKET'
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

// ---- Apply payload ---------------------------------------------------------

export interface LostTicketAppliedArticle {
  name: string
  description: string
  code: string
  admin_id: number
}

export interface LostTicketPaymentSummary {
  subtotal: number
  discounts: number
  tax_rate: number
  tax_value: number
  total: number
  is_cancelled: boolean
  tariff_relev_time: string
}

// ---- POST /transactions ---------------------------------------------------

export interface LostTicketTransactionPayload {
  vehicle_info: {
    image: string
    entry_image: string
    media: { lpn: string; barcode: string; rfid: string; uhf: string; oa: string }
    external_unique_id: string
    card_type: string
    entry_time: string
    parking_duration: string
  }
  transactions: Record<string, unknown>
  payment_summary: LostTicketPaymentSummary
  applied_article: LostTicketAppliedArticle
  cashier: Cashier
  is_untracked: boolean
}

// { status: 200, message: "Transaction added successfully" }
export type LostTicketTransactionResponse = MessageResponse