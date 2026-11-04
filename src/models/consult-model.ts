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