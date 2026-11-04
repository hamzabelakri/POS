import { useEffect } from 'react'
import { AxiosError } from 'axios'
import { useQuery } from '@tanstack/react-query'
import { AlertEnum } from '@/models/alert-model'
import {
  PlateSearchQueryParams,
  PlateSearchResponse,
  ProceedConsultPayload,
} from '@/models/consult-model'
import { getPlateSearch, proceedConsult } from '@/service/consult'
import { useAlertStore } from '@/stores/alert-store'

// `params` is null until the user clicks Search for the first time
export function usePlateSearch(
  params: PlateSearchQueryParams | null,
  options?: { notifyOnError?: boolean }
) {
  const { notifyOnError = true } = options ?? {}
  const { showAlert } = useAlertStore()

  const query = useQuery<PlateSearchResponse, AxiosError<{ error?: string }>>({
    queryKey: ['plate-search', params],
    queryFn: () => getPlateSearch(params!),
    enabled: !!params,
    retry: 1,
  })

  useEffect(() => {
    if (!notifyOnError || !query.error) return
    console.error('Error fetching plate search:', query.error)
    showAlert({
      message: query.error?.response?.data?.error ?? query.error.message,
      type: AlertEnum.ERROR,
    })
  }, [query.error, notifyOnError, showAlert])

  return query
}

import { useMutation } from '@tanstack/react-query'

export function useProceedConsult(options?: { onSuccess?: () => void }) {
  const { showAlert } = useAlertStore()

  return useMutation<
    void,
    AxiosError<{ error?: string }>,
    ProceedConsultPayload
  >({
    mutationFn: proceedConsult,
    onSuccess: () => options?.onSuccess?.(),
    onError: (error) =>
      showAlert({
        message: error.response?.data?.error ?? error.message,
        type: AlertEnum.ERROR,
      }),
  })
}