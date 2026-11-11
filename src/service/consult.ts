import { endOfDay } from 'date-fns'
import { type DateRange } from 'react-day-picker'
import axiosApi from '@/lib/axios'
import {
  PlateSearchQueryParams,
  PlateSearchResult,
  ProceedConsultPayload,
  UntrackedConsultPayload,
} from '@/models/consult-model'

const PLATE_SEARCH_ENDPOINT = `/search`
const CONSULT_ENDPOINT = `/consult`
const CONSULT_UNTRACKED_ENDPOINT = `/consult/untracked`

export const PLATE_SEARCH_PAGE_SIZE = 5

export const normalizePlate = (plate: string) =>
  plate.replace(/\s/g, '').toUpperCase()

export const buildPlateSearchParams = (
  plate: string,
  range: DateRange | undefined,
  page = 1,
  laneId?: string
): PlateSearchQueryParams => {
  const from = range?.from
  const to = range?.to ?? (from ? endOfDay(from) : undefined)
  return {
    license_plate: normalizePlate(plate) || undefined,
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
): Promise<PlateSearchResult> => {
  const response = await axiosApi.get(PLATE_SEARCH_ENDPOINT, { params })
  return response?.data
}

// POST /consult?search=true (fire-and-forget, the response is discarded)
export const proceedConsult = async (
  payload: ProceedConsultPayload
): Promise<void> => {
  await axiosApi.post(CONSULT_ENDPOINT, payload, { params: { search: true } })
}


// POST /consult/untracked (fire-and-forget, the response is discarded)
export const proceedUntrackedConsult = async (
  payload: UntrackedConsultPayload
): Promise<void> => {
  await axiosApi.post(CONSULT_UNTRACKED_ENDPOINT, payload)
}