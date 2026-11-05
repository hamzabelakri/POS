export type Article = {
  id: number
  code: string
  title: string
  description?: string
  iconUrl?: string 
  amount: number
  isDiscount: boolean 
  permissionRequired: boolean
  disabled: boolean 
}


export type BillingLine = { key: number; article: Article }