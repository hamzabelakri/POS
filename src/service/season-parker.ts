import axiosApi from '@/lib/axios'
import {
  SeasonParkerExitPayload,
  SeasonParkerSearchQueryParams,
  SeasonParkerSearchResponse,
} from '@/models/season-parker-model'

const SEARCH_ENDPOINT = `/season-parkers/search`
const EXIT_ENDPOINT = `/season-parkers/exit`
export const SEASON_PARKER_PAGE_SIZE = 5

export const buildSeasonParkerParams = (
  plate: string[],
  cardNumber: string,
  page = 1
): SeasonParkerSearchQueryParams => ({
  // empty values are sent as undefined so axios omits them
  lpn: plate.join('').trim() || undefined,
  card_number: cardNumber.trim() || undefined,
  page,
  page_size: SEASON_PARKER_PAGE_SIZE,
})

// GET /season-parkers/search?lpn=&card_number=&page=1&page_size=5
// Returns ApiResponse<SeasonParkerSearchData>
export const getSeasonParkerSearch = async (
  params?: SeasonParkerSearchQueryParams
): Promise<SeasonParkerSearchResponse> => {
  const response = await axiosApi.get(SEARCH_ENDPOINT, { params })
  return response.data
}

// POST /season-parkers/exit (the response is discarded)
export const seasonParkerExit = async (
  payload: SeasonParkerExitPayload
): Promise<void> => {
  await axiosApi.post(EXIT_ENDPOINT, payload)
}