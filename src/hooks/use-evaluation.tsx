import { AxiosError, isAxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'
import { AlertEnum } from '@/models/alert-model'
import { ApiError } from '@/models/api'
import {
  AuthorizeEvaluationPayload,
  AuthorizeEvaluationResponse,
} from '@/models/evaluation-model'
import { authorizeEvaluation } from '@/service/evaluation'
import { useAlertStore } from '@/stores/alert-store'

export function useAuthorizeEvaluation() {
  const { showAlert } = useAlertStore()

  return useMutation<
    AuthorizeEvaluationResponse,
    AxiosError<ApiError> | Error,
    AuthorizeEvaluationPayload
  >({
    mutationFn: authorizeEvaluation,
    onSuccess: (res) => {
      // outer message: "Authorization successful"
      // (inner one is res.data.message: "Password validated successfully")
      showAlert({ message: res.message, type: AlertEnum.SUCCESS })
    },
    onError: (error) => {
      console.error('Error authorizing evaluation password:', error)
      showAlert({
        message: isAxiosError<ApiError>(error)
          ? (error.response?.data?.error ?? error.message)
          : error.message,
        type: AlertEnum.ERROR,
      })
    },
  })
}
