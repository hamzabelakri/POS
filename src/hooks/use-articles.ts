import { useMemo } from 'react'
import { AxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AlertEnum } from '@/models/alert-model'
import { ApiError } from '@/models/api'
import {
  Article,
  LostTicketAppliedArticle,
  LostTicketCancelPayload,
  LostTicketCancelResponse,
  LostTicketCashier,
  LostTicketTransactionPayload,
  LostTicketTransactionResponse,
} from '@/models/articles-model'
import { PosProduct, PosProductTranslation } from '@/models/pos-config-model'
import {
  cancelLostTicketPayment,
  createLostTicketTransaction,
} from '@/service/articles'
import { useAlertStore } from '@/stores/alert-store'
import { useAuthStore } from '@/stores/auth-store'
import { usePosConfigStore } from '@/stores/pos-config-store'

const ZERO_DATE = '0001-01-01 00:00:00' // the backend's "no date" value
const ADMIN_ID = 1 // TODO: confirm the source of admin_id

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

/* ───────── LOST_TICKET: shared helpers ───────── */

const toAppliedArticle = (article: Article): LostTicketAppliedArticle => ({
  name: article.name, // '' when there is no translated name
  description: article.description ?? '',
  code: article.code,
  admin_id: ADMIN_ID,
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
  cashier: LostTicketCashier
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
    applied_article: toAppliedArticle(article),
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
  const submitLostTicket = (article: Article, onSuccess: () => void) =>
    mutation.mutate(buildLostTicketTransactionPayload(article, cashier), {
      onSuccess,
    })

  return { ...mutation, submitLostTicket }
}

/* ───────── LOST_TICKET: POST /payments/cancel ───────── */

export function buildLostTicketCancelPayload(
  article: Article,
  cashier: LostTicketCashier
): LostTicketCancelPayload {
  return {
    vehicle_info: {
      image: '',
      entry_image: '',
      media: {},
      card_type: '',
      entry_time: ZERO_DATE,
      tariff_time: ZERO_DATE,
      parking_duration: '',
      external_unique_id: '',
    },
    transactions: {
      '1': {
        code: article.code,
        type: 'fee', // lost ticket is always a fee
        value: article.amount,
        is_discount: article.isDiscount,
        discount_type: article.discountType,
        discount_value: article.discountValue,
        permission_required: article.permissionRequired,
        admin_id: ADMIN_ID,
      },
    },
    payment_summary: {
      subtotal: article.amount,
      discounts: 0,
      tax_rate: 0,
      tax_value: 0, // no matching data yet
      total: article.amount,
      is_cancelled: true,
      tariff_relev_time: ZERO_DATE,
    },
    applied_article: toAppliedArticle(article),
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

  // `onSuccess` runs only after the cancel succeeds (removes the line).
  const cancelLostTicket = (article: Article, onSuccess: () => void) =>
    mutation.mutate(buildLostTicketCancelPayload(article, cashier), {
      onSuccess,
    })

  return { ...mutation, cancelLostTicket }
}