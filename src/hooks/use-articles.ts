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
  LostTicketCancelPayload,
  LostTicketCancelResponse,
  LostTicketCashier,
  LostTicketTransactionPayload,
  LostTicketTransactionResponse,
  LostTicketWithCalculationPayload,
  LostTicketWithCalculationResponse,
} from '@/models/articles-model'
import { PosProduct, PosProductTranslation } from '@/models/pos-config-model'
import type { ExitCar } from '@/models/sse-model'
import {
  calculateLostTicketTariff,
  cancelLostTicketPayment,
  createLostTicketTransaction,
} from '@/service/articles'
import { useAlertStore } from '@/stores/alert-store'
import { useAuthStore } from '@/stores/auth-store'
import { usePosConfigStore } from '@/stores/pos-config-store'
import { useSSEStore } from '@/stores/sse-store'

const ZERO_DATE = '0001-01-01 00:00:00' // the backend's "no date" value

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

/* ───────── Billed lines (derived from the last exit_car) ───────── */

// Every transaction in the event whose code exists in the POS config becomes a
// line, filled with the config's data (title, icon, ...). Unknown codes are skipped.
export function useBilledLines(): BillingLine[] {
  const { articles } = usePosArticles()
  const event = useSSEStore((s) => s.exitEvent)
  const byCode = useMemo(
    () => new Map(articles.map((a) => [a.code, a])),
    [articles]
  )

  return useMemo(() => {
    if (event?.type !== 'exit_car') return []
    return Object.entries(event.data.transactions).flatMap(([key, fee]) => {
      const article = byCode.get(fee.code)
      if (!article) {
        console.warn('Billing: unknown article code', fee.code)
        return []
      }
      return [{ key, article }]
    })
  }, [event, byCode])
}

/* ───────── Shared helpers ───────── */

// adminId: the admin who approved the action (evaluation response),
// 0 when the article has no evaluation.
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

/* ───────── Apply an article: POST /transactions ───────── */

export function buildTransactionPayload(
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
    transactions: {}, // the backend fills it in (see the exit_car message)
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

export function useCreateTransaction() {
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
          'Unable to add the article. Please try again.',
        type: AlertEnum.ERROR,
      })
    },
  })

  // No onSuccess: the line appears when the exit_car message arrives.
  const submitArticle = (article: Article, adminId = 0) =>
    mutation.mutate(buildTransactionPayload(article, cashier, adminId))

  return { ...mutation, submitArticle }
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
    transactions: {}, // the backend fills it in (see the exit_car message)
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

  // `onSuccess` only closes the modal; the line comes from the SSE message.
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

/* ───────── Cancel any billed line: POST /payments/cancel ───────── */

// Resend the last exit_car data, limited to the removed line's transaction,
// marked as cancelled, with the cashier filled in by the frontend.
export function buildCancelPayload(
  event: ExitCar,
  key: string,
  cashier: LostTicketCashier
): LostTicketCancelPayload {
  return {
    ...event,
    transactions: { [key]: event.transactions[key] },
    payment_summary: { ...event.payment_summary, is_cancelled: true },
    cashier,
  }
}

export function useCancelArticle() {
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
          'Unable to cancel the article. Please try again.',
        type: AlertEnum.ERROR,
      })
    },
  })

  const cancelArticle = (line: BillingLine) => {
    // Read the store on click: it is the latest backend state.
    const event = useSSEStore.getState().exitEvent
    const data = event?.type === 'exit_car' ? event.data : null

    if (!data?.transactions[line.key]) {
      showAlert({
        message: 'No matching vehicle data to cancel. Please try again.',
        type: AlertEnum.ERROR,
      })
      return
    }

    mutation.mutate(buildCancelPayload(data, line.key, cashier), {
      // No exit_car follows a cancel, so update the stored event ourselves.
      onSuccess: () => useSSEStore.getState().removeExitTransaction(line.key),
    })
  }

  return { ...mutation, cancelArticle }
}