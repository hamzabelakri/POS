export type Article = {
  id: number
  code: string
  title: string
  description?: string
  iconUrl?: string // from product.icon; no icon is shown when empty
  amount: number
  isDiscount: boolean
  permissionRequired: boolean
}


export type BillingLine = { key: number; article: Article }