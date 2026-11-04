export interface BucketTransaction {
  code: string
  type: string
  value: number
  is_discount: boolean
  discount_type: string
  discount_value: number
  permission_required: boolean
  admin_id: number
}

export interface BucketMedia {
  lpn?: string
  barcode?: string
  rfid?: string
  uhf?: string
  oa?: string
}

export interface BucketVehicleInfo {
  image: string
  entry_image: string
  media: BucketMedia
  card_type: string
  entry_time: string
  tariff_time?: string
  parking_duration: string
  external_unique_id: string
}

export interface BucketSummary {
  subtotal: number
  discounts: number
  tax_rate: number
  tax_value: number
  total: number
  is_cancelled: boolean
  tariff_relev_time: string
}

export interface BucketAppliedArticle {
  name: string
  description: string
  code: string
  admin_id: number
}

export interface BucketCashier {
  name: string
  shift_id: number
}

export interface BucketData {
  vehicle_info: BucketVehicleInfo
  transactions: Record<string, BucketTransaction>
  payment_summary: BucketSummary
  applied_article: BucketAppliedArticle
  cashier: BucketCashier
  is_untracked: boolean
}

// ASSUMED request body, please confirm
export interface CalculateTariffPayload {
  media: { lpn: string }
  entry_time: string // ISO 8601
}