import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import type { PosProduct } from "@/models/pos-config-model"
import { usePosConfigStore } from "@/stores/pos-config-store"
import { Article } from "@/models/articles-model"

function toArticle(product: PosProduct, lang: string): Article {
  const translations = product.translations ?? []
  const translation =
    translations.find((tr) => tr.language === lang) ??
    translations.find((tr) => tr.language === "en") ??
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
  }
}

// Articles and validations come from the saved POS config (`pos.products`).
export function usePosArticles() {
  const { i18n } = useTranslation()
  const products = usePosConfigStore((state) => state.config?.pos.products)
  const lang = i18n.language?.split("-")[0] ?? "en"

  return useMemo(() => {
    const active = (products ?? [])
      .filter((product) => product.is_active)
      .map((product) => toArticle(product, lang))

    return {
      articles: active.filter((a) => !a.isDiscount),
      validations: active.filter((a) => a.isDiscount),
    }
  }, [products, lang])
}