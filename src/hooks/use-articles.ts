import { useMemo } from 'react'
import { AxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AlertEnum } from '@/models/alert-model'
import { ApiError } from '@/models/api'
import {
  Article,
  BillingLine,
  LostTicketTransactionPayload,
  LostTicketTransactionResponse,
} from '@/models/articles-model'
import type { Cashier } from '@/models/payment-model'
import { PosProduct, PosProductTranslation } from '@/models/pos-config-model'
import { createLostTicketTransaction } from '@/service/articles'
import { useAlertStore } from '@/stores/alert-store'
import { usePosConfigStore } from '@/stores/pos-config-store'
import { useSSEStore } from '@/stores/sse-store'
import { toAppliedArticle, useShiftCashier } from '@/hooks/use-payment'

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
    return Object.entries(event.data.transactions ?? {}).flatMap(([key, fee]) => {
      const article = byCode.get(fee.code)
      if (!article) {
        console.warn('Billing: unknown article code', fee.code)
        return []
      }
      return [{ key, article }]
    })
  }, [event, byCode])
}

/* ───────── Apply an article: POST /transactions ───────── */

export function buildTransactionPayload(
  article: Article,
  cashier: Cashier,
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