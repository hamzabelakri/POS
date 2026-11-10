import type { ApiResponse, PaginatedData } from '@/models/api'

export interface PlateSearchDetail {
  image: string
  image_id: string
  external_unique_id: string
  license_plate: string
  card_type: string
  entry_unit: number
  entry_time: string // "YYYY-MM-DD HH:mm:ss"
}

export interface SearchData {
  cars: PlateSearchDetail[]
}

export type PlateSearchResult = ApiResponse<PaginatedData<SearchData>>

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


// POST /consult/untracked
export interface UntrackedConsultPayload {
  lpn: string
}