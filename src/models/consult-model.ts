export interface PlateSearchCar {
  image: string
  image_id: string
  external_unique_id: string
  license_plate: string
  card_type: string
  entry_unit: number
  entry_time: string // "YYYY-MM-DD HH:mm:ss"
}

export interface PlateSearchData {
  cars: PlateSearchCar[]
  current_page: number
  page_size: number
  total_pages: number
}

export interface PlateSearchResponse {
  status: number
  data: PlateSearchData
}

export interface PlateSearchQueryParams {
  license_plate?: string
  from?: string // ISO 8601
  to?: string // ISO 8601
  lane_id?: number
  page?: number
  page_size?: number
}

// POST /consult?search=true
export interface ProceedConsultPayload {
  media: { lpn: string }
  image_id: string
  entry_time: string
}


export type ExitCarTransaction = {
  code: string
  type: string
  value: number
  is_discount: boolean
  discount_type: string
  discount_value: number
  permission_required: boolean
  admin_id: number
}

export type ExitCar = {
  vehicle_info: {
    image: string
    entry_image: string
    media: { lpn: string }
    card_type: string
    entry_time: string
    tariff_time: string
    parking_duration: string
    external_unique_id: string
  }
  
  transactions: Record<string, ExitCarTransaction>
  payment_summary: {
    subtotal: number
    discounts: number
    tax_rate: number
    tax_value: number
    total: number
    is_cancelled: boolean
    tariff_relev_time: string
  }
  applied_article: {
    name: string
    description: string
    code: string
    admin_id: number
  }
  cashier: { name: string; shift_id: number }
  is_untracked: boolean
}

export type SearchCarData = {
  license_plate: string
  bucket: ExitCar
  cars: unknown[]
  total_pages: number
}

export type ExitVehicleEvent =
  | { type: "exit_car"; data: ExitCar }
  | { type: "search_car"; data: SearchCarData }


/**
 * Returns the src if it holds real image data, otherwise null.
 * The backend sends "data:image/png;base64," (empty payload) when there is no image.
 */
export function toImageSrc(src?: string | null): string | null {
  if (!src) return null
  const marker = "base64,"
  const i = src.indexOf(marker)
  if (i !== -1 && src.length === i + marker.length) return null
  return src
}