import { ApiResponse } from '@/models/api'
import { PmsArticleDefinition } from '@/models/pos-config-model'

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

// One row in the billing list.
// - key: unique per row (the same article can appear on several rows)
// - adminId: the admin who approved the article through the evaluation;
//   set for the lost ticket, and reused when cancelling it
export type BillingLine = {
  key: number
  article: Article
  adminId?: number
  calculation?: LostTicketCalculation
}

// Responses we don't read in the UI: only status and message (no data).
type MessageResponse = Omit<ApiResponse<unknown>, 'data'>

// ---- Shared by the LOST_TICKET create and cancel payloads ----------------

export interface LostTicketAppliedArticle {
  name: string
  description: string
  code: string
  admin_id: number
}

export interface LostTicketCashier {
  name: string
  shift_id: number
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
    media: {
      lpn: string
      barcode: string
      rfid: string
      uhf: string
      oa: string
    }
    external_unique_id: string
    card_type: string
    entry_time: string
    parking_duration: string
  }
  transactions: Record<string, unknown>
  payment_summary: LostTicketPaymentSummary
  applied_article: LostTicketAppliedArticle
  cashier: LostTicketCashier
  is_untracked: boolean
}

// { status: 200, message: "Transaction added successfully" }
export type LostTicketTransactionResponse = MessageResponse

// ---- POST /payments/cancel?print_receipt=false ----------------------------

export interface LostTicketCancelFee {
  code: string
  type: string
  value: number
  is_discount: boolean
  discount_type: string
  discount_value: number
  permission_required: boolean
  admin_id: number
}

export interface LostTicketCancelPayload {
  vehicle_info: {
    image: string
    entry_image: string
    media: Record<string, string>
    card_type: string
    entry_time: string
    tariff_time: string
    parking_duration: string
    external_unique_id: string
  }
  transactions: Record<string, LostTicketCancelFee>
  payment_summary: LostTicketPaymentSummary
  applied_article: LostTicketAppliedArticle
  cashier: LostTicketCashier
  is_untracked: boolean
}

// { status: 200, message: "Payment cancelled successfully" }
export type LostTicketCancelResponse = MessageResponse

// Calculation data kept on the billing line, reused when cancelling
export type LostTicketCalculation = {
  entryTime: string // ISO, what the cashier entered
  calculatedAt: string // ISO, when the tariff was calculated
}

// ---- POST /payments/calculate-tariff ---------------------------------------
export interface LostTicketWithCalculationPayload {
  vehicle_info: {
    image: string
    entry_image: string
    media: { lpn: string }
    card_type: string
    entry_time: string
    tariff_time: string
    parking_duration: string
    external_unique_id: string
  }
  transactions: Record<string, unknown>
  payment_summary: LostTicketPaymentSummary
  applied_article: LostTicketAppliedArticle
  cashier: LostTicketCashier
  is_untracked: boolean
}

// { status: 200, message: "Tariff calculated successfully" }
export type LostTicketWithCalculationResponse = MessageResponse
