import { useEffect } from 'react'
import { AxiosError } from 'axios'
import { useQuery } from '@tanstack/react-query'
import { AlertEnum } from '@/models/alert-model'
import { ID } from '@/models/api'
import {
  ShiftReportQueryParams,
  ShiftReportResponse,
} from '@/models/shift-report-model'
import { getShiftReport } from '@/service/shift-report'
import { useAlertStore } from '@/stores/alert-store'

export function useShiftReport(
  shiftId: ID,
  params?: ShiftReportQueryParams
) {
  const { showAlert } = useAlertStore()

  const query = useQuery<ShiftReportResponse, AxiosError<{ error?: string }>>({
    queryKey: ['shift-report', shiftId, params],
    queryFn: () => getShiftReport(shiftId!, params),
    enabled: !!shiftId,
    retry: 1,
  })

  // `onError` was removed from useQuery in React Query v5, so errors are
  // surfaced through an effect (works on v4 and v5).
  useEffect(() => {
    if (!query.error) return
    console.error(`Error fetching report for shift ${shiftId}:`, query.error)
    showAlert({
      message: query.error?.response?.data?.error ?? query.error.message,
      type: AlertEnum.ERROR,
    })
  }, [query.error, shiftId, showAlert])

  return query
}