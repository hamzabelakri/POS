import { ApiResponse } from "@/models/api"

export interface SeasonParker {
  participant_id: number
  company_id: number
  participant_first_name: string
  participant_last_name: string
  card_number: string
  lpn: string[]
  neutral: number
  blocked: boolean
  validity_start: string // "YYYY-MM-DD HH:mm:ss"
  validity_end: string // "YYYY-MM-DD HH:mm:ss"
  facility_present: number
  epan: string
}

export interface SeasonParkerSearchQueryParams {
  lpn?: string
  card_number?: string
  page?: number
  page_size?: number
}

// POST /season-parkers/exit
export interface SeasonParkerExitPayload {
  participant_id: number
  company_id: number
}

// Pagination fields live inside `data` for this endpoint (no total_rows).
export interface SeasonParkerSearchData {
  current_page: number
  page_size: number
  season_parkers: SeasonParker[]
  total_pages: number
}

// GET /season-parkers/search => { status, message, data: SeasonParkerSearchData }
export type SeasonParkerSearchResponse = ApiResponse<SeasonParkerSearchData>