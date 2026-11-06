import { PmsArticleDefinition } from '@/models/pos-config-model'

export type Article = {
  id: number
  code: string
  title: string // resolved from translations (current language)
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

export type BillingLine = { key: number; article: Article }