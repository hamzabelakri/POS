import { useMemo } from 'react'
import { AxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AlertEnum } from '@/models/alert-model'
import { ApiError } from '@/models/api'
import {
  Article,
  BillingLine,
  LostTicketAppliedArticle,
  LostTicketCalculation,
  LostTicketCancelPayload,
  LostTicketCancelResponse,
  LostTicketCashier,
  LostTicketTransactionPayload,
  LostTicketTransactionResponse,
  LostTicketWithCalculationPayload,
  LostTicketWithCalculationResponse,
} from '@/models/articles-model'
import { PosProduct, PosProductTranslation } from '@/models/pos-config-model'
import {
  calculateLostTicketTariff,
  cancelLostTicketPayment,
  createLostTicketTransaction,
} from '@/service/articles'
import { useAlertStore } from '@/stores/alert-store'
import { useAuthStore } from '@/stores/auth-store'
import { usePosConfigStore } from '@/stores/pos-config-store'

const ZERO_DATE = '0001-01-01 00:00:00' // the backend's "no date" value

// ISO ("2026-11-09T12:42:00.000Z") -> the backend's "yyyy-MM-dd HH:mm:ss" (UTC)
const toBackendDate = (iso: string) => iso.slice(0, 19).replace('T', ' ')

const hasName = (tr: PosProductTranslation) => !!tr.name?.trim()

function toArticle(product: PosProduct, lang: string): Article {
  const translations = product.translations ?? []
  // First translation WITH a name: current language, then 'en', then any.
  const translation =
    translations.find((tr) => tr.language === lang && hasName(tr)) ??
    translations.find((tr) => tr.language === 'en' && hasName(tr)) ??
    translations.find(hasName)

  const name = translation?.name ?? ''

  return {
    id: product.id,
    code: product.code,
    name,
    title: name || product.code,
    description: translation?.description,
    iconUrl: product.icon || undefined,
    amount: product.amount,
    isProduction: product.is_production,
    isActive: product.is_active,
    isDiscount: product.is_discount,
    discountType: product.discount_type,
    discountValue: product.discount_value,
    checkPms: product.check_pms,
    permissionRequired: product.permission_required,
    pmsArticleDefinition: product.pms_article_definition,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  }
}

// Articles come straight from the saved POS config (`pos.products`).
// No filtering here: visibility/availability rules live in the UI.
export function usePosArticles() {
  const { i18n } = useTranslation()
  const products = usePosConfigStore((state) => state.config?.pos?.products)
  const lang = i18n.language?.split('-')[0] ?? 'en'

  return useMemo(
    () => ({ articles: (products ?? []).map((p) => toArticle(p, lang)) }),
    [products, lang]
  )
}

/* ───────── Shared helpers ───────── */

// adminId is the id of the admin who approved the action (evaluation response).
// 0 when the article has no evaluation (e.g. lost ticket with calculation).
const toAppliedArticle = (
  article: Article,
  adminId: number
): LostTicketAppliedArticle => ({
  name: article.name, // '' when there is no translated name
  description: article.description ?? '',
  code: article.code,
  admin_id: adminId,
})

// Cashier name and shift id come from the saved shift (falls back to the cashier's name).
function useShiftCashier(): LostTicketCashier {
  const cashier = useAuthStore((s) => s.cashier)
  const shift = useAuthStore((s) => s.shift)
  return {
    name:
      shift?.cashier_name ??
      [cashier?.first_name, cashier?.last_name].filter(Boolean).join(' '),
    shift_id: shift?.id ?? 0,
  }
}

/* ───────── LOST_TICKET: POST /transactions ───────── */

export function buildLostTicketTransactionPayload(
  article: Article,
  cashier: LostTicketCashier,
  adminId: number
): LostTicketTransactionPayload {
  return {
    vehicle_info: {
      image: '',
      entry_image: '',
      media: { lpn: '', barcode: '', rfid: '', uhf: '', oa: '' },
      external_unique_id: '',
      card_type: '',
      entry_time: '',
      parking_duration: '',
    },
    transactions: {},
    payment_summary: {
      subtotal: 0,
      discounts: 0,
      tax_rate: 0,
      tax_value: 0,
      total: 0,
      is_cancelled: false,
      tariff_relev_time: '',
    },
    applied_article: toAppliedArticle(article, adminId),
    cashier,
    is_untracked: false,
  }
}

export function useCreateLostTicketTransaction() {
  const { showAlert } = useAlertStore()
  const cashier = useShiftCashier()

  const mutation = useMutation<
    LostTicketTransactionResponse,
    AxiosError<ApiError>,
    LostTicketTransactionPayload
  >({
    mutationFn: createLostTicketTransaction,
    onError: (error) => {
      showAlert({
        message:
          error?.response?.data?.error ||
          'Unable to create the lost ticket transaction. Please try again.',
        type: AlertEnum.ERROR,
      })
    },
  })

  // `onSuccess` runs only after the POST succeeds (adds the article).
  const submitLostTicket = (
    article: Article,
    adminId: number,
    onSuccess: () => void
  ) =>
    mutation.mutate(
      buildLostTicketTransactionPayload(article, cashier, adminId),
      { onSuccess }
    )

  return { ...mutation, submitLostTicket }
}

/* ───────── LOST_TICKET_WITH_CALCULATION: POST /payments/calculate-tariff ───────── */

type CalculationValues = { lpn: string; entryTime: Date }

export function buildLostTicketWithCalculationPayload(
  article: Article,
  cashier: LostTicketCashier,
  values: CalculationValues
): LostTicketWithCalculationPayload {
  const entryIso = values.entryTime.toISOString() // "2026-11-09T12:42:00.000Z"
  return {
    vehicle_info: {
      image: '',
      entry_image: '',
      media: { lpn: values.lpn },
      card_type: '',
      entry_time: entryIso,
      tariff_time: entryIso,
      parking_duration: '',
      external_unique_id: '',
    },
    transactions: {}, // TODO: the real payload sends a LOST_TICKET fee here
    payment_summary: {
      subtotal: 0,
      discounts: 0,
      tax_rate: 0,
      tax_value: 0,
      total: 0,
      is_cancelled: false,
      tariff_relev_time: ZERO_DATE,
    },
    applied_article: toAppliedArticle(article, 0), // no evaluation: admin_id 0
    cashier,
    is_untracked: false,
  }
}

export function useCalculateLostTicketTariff() {
  const { showAlert } = useAlertStore()
  const cashier = useShiftCashier()

  const mutation = useMutation<
    LostTicketWithCalculationResponse,
    AxiosError<ApiError>,
    LostTicketWithCalculationPayload
  >({
    mutationFn: calculateLostTicketTariff,
    onError: (error) => {
      showAlert({
        message:
          error?.response?.data?.error ||
          'Unable to calculate the lost ticket tariff. Please try again.',
        type: AlertEnum.ERROR,
      })
    },
  })

  // `onSuccess` runs only after the calculation succeeds (adds the article).
  const submitCalculation = (
    article: Article,
    values: CalculationValues,
    onSuccess: () => void
  ) =>
    mutation.mutate(
      buildLostTicketWithCalculationPayload(article, cashier, values),
      { onSuccess }
    )

  return { ...mutation, submitCalculation }
}

/* ───────── Cancel (both lost ticket articles): POST /payments/cancel ───────── */

export function buildLostTicketCancelPayload(
  article: Article,
  cashier: LostTicketCashier,
  adminId: number,
  calculation?: LostTicketCalculation
): LostTicketCancelPayload {
  const entryTime = calculation
    ? toBackendDate(calculation.entryTime)
    : ZERO_DATE

  return {
    vehicle_info: {
      image: '',
      entry_image: '',
      media: {},
      card_type: '',
      entry_time: entryTime,
      tariff_time: entryTime,
      parking_duration: calculation ? '0m' : '', // as in the real payloads
      external_unique_id: '',
    },
    transactions: {
      '1': {
        code: article.code,
        type: 'fee', // always a fee
        value: article.amount, // TODO: calculated tariff for the calculation article
        is_discount: article.isDiscount,
        discount_type: article.discountType,
        discount_value: article.discountValue,
        permission_required: article.permissionRequired,
        admin_id: adminId,
      },
    },
    payment_summary: {
      subtotal: article.amount, // TODO: calculated tariff
      discounts: 0,
      tax_rate: 0, // TODO: the real payload sends 20 for the calculation article
      tax_value: 0, // TODO: no matching data yet
      total: article.amount, // TODO: calculated tariff
      is_cancelled: true,
      tariff_relev_time: calculation
        ? toBackendDate(calculation.calculatedAt)
        : ZERO_DATE,
    },
    applied_article: toAppliedArticle(article, adminId),
    cashier,
    is_untracked: false,
  }
}

export function useCancelLostTicketPayment() {
  const { showAlert } = useAlertStore()
  const cashier = useShiftCashier()

  const mutation = useMutation<
    LostTicketCancelResponse,
    AxiosError<ApiError>,
    LostTicketCancelPayload
  >({
    mutationFn: cancelLostTicketPayment,
    onError: (error) => {
      showAlert({
        message:
          error?.response?.data?.error ||
          'Unable to cancel the lost ticket. Please try again.',
        type: AlertEnum.ERROR,
      })
    },
  })

  // Takes the whole billing line, so the same function serves both articles.
  // `onSuccess` runs only after the cancel succeeds (removes the line).
  const cancelLostTicket = (line: BillingLine, onSuccess: () => void) =>
    mutation.mutate(
      buildLostTicketCancelPayload(
        line.article,
        cashier,
        line.adminId ?? 0,
        line.calculation
      ),
      { onSuccess }
    )

  return { ...mutation, cancelLostTicket }
}