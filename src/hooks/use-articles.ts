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