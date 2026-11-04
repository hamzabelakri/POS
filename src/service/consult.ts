import { endOfDay } from 'date-fns'
import { type DateRange } from 'react-day-picker'
import axiosApi from '@/lib/axios'
import {
  PlateSearchQueryParams,
  PlateSearchResponse,
  ProceedConsultPayload,
} from '@/models/consult-model'

const PLATE_SEARCH_ENDPOINT = `/search`
const CONSULT_ENDPOINT = `/consult`
export const PLATE_SEARCH_PAGE_SIZE = 5

export const buildPlateSearchParams = (
  plate: string[],
  range: DateRange | undefined,
  page = 1,
  laneId?: string
): PlateSearchQueryParams => {
  const from = range?.from
  // a single-day pick has no `to`: fall back to the end of that day
  const to = range?.to ?? (from ? endOfDay(from) : undefined)
  return {
    license_plate: plate.join('').trim().toUpperCase() || undefined,
    from: from?.toISOString(),
    to: to?.toISOString(),
    lane_id: laneId ? Number(laneId) : undefined,
    page,
    page_size: PLATE_SEARCH_PAGE_SIZE,
  }
}

// GET /search?license_plate=AZERTY&from=...&to=...&lane_id=101&page=1&page_size=5
export const getPlateSearch = async (
  params?: PlateSearchQueryParams
): Promise<PlateSearchResponse> => {
  const response = await axiosApi.get(PLATE_SEARCH_ENDPOINT, { params })
  return response?.data
}

// POST /consult?search=true (fire-and-forget, the response is discarded)
export const proceedConsult = async (
  payload: ProceedConsultPayload
): Promise<void> => {
  await axiosApi.post(CONSULT_ENDPOINT, payload, { params: { search: true } })
}