import axiosApi from '@/lib/axios'
import {
  ShiftReportQueryParams,
  ShiftReportResponse,
} from '@/models/shift-report-model'

const SHIFT_ENDPOINT = `/shifts`

// GET /shifts/:shiftId/report?page=1&page_size=10&lpn=azerty
export const getShiftReport = async (
  shiftId: number,
  params?: ShiftReportQueryParams
): Promise<ShiftReportResponse> => {
  const response = await axiosApi.get(`${SHIFT_ENDPOINT}/${shiftId}/report`, {
    params,
  })
  return response?.data
}