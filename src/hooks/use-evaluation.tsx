import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { AlertEnum } from '@/models/alert-model'
import { ApiError } from '@/models/api'
import {
  AuthorizeEvaluationPayload,
  AuthorizeEvaluationResponse,
  EvaluationType,
} from '@/models/evaluation-model'
import { authorizeEvaluation } from '@/service/evaluation'
import { useAlertStore } from '@/stores/alert-store'

export function useAuthorizeEvaluation(type: EvaluationType) {
  const { showAlert } = useAlertStore()

  return useMutation<
    AuthorizeEvaluationResponse,
    AxiosError<ApiError>,
    AuthorizeEvaluationPayload
  >({
    mutationFn: (payload) => authorizeEvaluation(type, payload),
    onError: (error) => {
      showAlert({
        message: error.response?.data?.error ?? error.message,
        type: AlertEnum.ERROR,
      })
    },
  })
}