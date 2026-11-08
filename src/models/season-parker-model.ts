import { ApiResponse, PaginatedData } from "@/models/api"

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

export interface SeasonParkerSearchData {
  season_parkers: SeasonParker[]
}

export type SeasonParkerSearchResponse =
  ApiResponse<PaginatedData<SeasonParkerSearchData>>