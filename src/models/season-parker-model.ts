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

// NOTE: not wrapped in { status, data } like the plate search response
export interface SeasonParkerSearchResponse {
  current_page: number
  page_size: number
  season_parkers: SeasonParker[]
  total_pages: number
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