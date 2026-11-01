import { useMutation } from '@tanstack/react-query'
import { AlertEnum } from '@/models/alert-model'
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
    Error,
    AuthorizeEvaluationPayload
  >({
    mutationFn: authorizeEvaluation,
    onSuccess: (data) => {
      showAlert({
        message: data?.data?.message,
        type: AlertEnum.SUCCESS,
      })
    },
    onError: (error: any) => {
      console.error('Error authorizing evaluation password:', error)
      showAlert({
        message: error?.response?.data?.error ?? error?.message,
        type: AlertEnum.ERROR,
      })
    },
  })
}