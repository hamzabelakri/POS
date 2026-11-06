import { AxiosError } from 'axios'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AlertEnum } from '@/models/alert-model'
import { ApiError } from '@/models/api'
import {
  SeasonParkerExitPayload,
  SeasonParkerSearchQueryParams,
  SeasonParkerSearchResponse,
} from '@/models/season-parker-model'
import { getSeasonParkerSearch, seasonParkerExit } from '@/service/season-parker'
import { useAlertStore } from '@/stores/alert-store'

export function useSeasonParkerSearch(
  params: SeasonParkerSearchQueryParams | null
) {
  const query = useQuery<SeasonParkerSearchResponse, AxiosError<ApiError>>({
    queryKey: ['season-parker-search', params],
    queryFn: () => getSeasonParkerSearch(params!),
    enabled: !!params,
    retry: 1,
  })

  return query
}

export function useSeasonParkerExit(options?: { onSuccess?: () => void }) {
  const { showAlert } = useAlertStore()

  return useMutation<void, AxiosError<ApiError>, SeasonParkerExitPayload>({
    mutationFn: seasonParkerExit,
    onSuccess: () => options?.onSuccess?.(),
    onError: (error) =>
      showAlert({
        message: error.response?.data?.error ?? error.message,
        type: AlertEnum.ERROR,
      }),
  })
}