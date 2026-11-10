import { AxiosError } from 'axios'
import { useQuery, useMutation } from '@tanstack/react-query'
import { AlertEnum } from '@/models/alert-model'
import { ApiError } from '@/models/api'
import {
  PlateSearchQueryParams,
  PlateSearchResult,
  ProceedConsultPayload,
  UntrackedConsultPayload,
} from '@/models/consult-model'
import { getPlateSearch, proceedConsult, proceedUntrackedConsult } from '@/service/consult'
import { useAlertStore } from '@/stores/alert-store'

// `params` is null until the user clicks Search for the first time
export function usePlateSearch(params: PlateSearchQueryParams | null) {
  const query = useQuery<PlateSearchResult, AxiosError<ApiError>>({
    queryKey: ['plate-search', params],
    queryFn: () => getPlateSearch(params!),
    enabled: !!params,
    retry: 1,
  })
  return query
}

export function useProceedConsult(options?: { onSuccess?: () => void }) {
  const { showAlert } = useAlertStore()

  return useMutation<void, AxiosError<ApiError>, ProceedConsultPayload>({
    mutationFn: proceedConsult,
    onSuccess: () => options?.onSuccess?.(),
    onError: (error) =>
      showAlert({
        message: error.response?.data?.error ?? error.message,
        type: AlertEnum.ERROR,
      }),
  })
}


export function useUntrackedConsult() {
  const { showAlert } = useAlertStore()

  return useMutation<void, AxiosError<ApiError>, UntrackedConsultPayload>({
    mutationFn: proceedUntrackedConsult,
    onError: (error) =>
      showAlert({
        message: error.response?.data?.error ?? error.message,
        type: AlertEnum.ERROR,
      }),
  })
}