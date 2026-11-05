import { useMemo } from 'react'
import { Article } from '@/models/articles-model'
import { PosProduct } from '@/models/pos-config-model'
import { useTranslation } from 'react-i18next'
import { usePosConfigStore } from '@/stores/pos-config-store'

function toArticle(product: PosProduct, lang: string): Article {
  const translations = product.translations ?? []
  const translation =
    translations.find((tr) => tr.language === lang) ??
    translations.find((tr) => tr.language === 'en') ??
    translations[0]

  return {
    id: product.id,
    code: product.code,
    title: translation?.name || product.code,
    description: translation?.description,
    iconUrl: product.icon || undefined,
    amount: product.amount,
    isDiscount: product.is_discount,
    permissionRequired: product.permission_required,
    disabled: !product.is_production && !product.is_active,
  }
}

// Articles come straight from the saved POS config (`pos.products`).
export function usePosArticles() {
  const { i18n } = useTranslation()
  const products = usePosConfigStore((state) => state.config?.pos.products)
  const lang = i18n.language?.split('-')[0] ?? 'en'

  return useMemo(
    () => ({ articles: (products ?? []).map((p) => toArticle(p, lang)) }),
    [products, lang]
  )
}
