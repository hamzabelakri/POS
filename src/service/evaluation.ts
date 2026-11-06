import axiosApi from '@/lib/axios'
import {
  AuthorizeEvaluationPayload,
  AuthorizeEvaluationResponse,
} from '@/models/evaluation-model'


export const AUTHORIZE_ENDPOINT = '/articles/authorize'

// POST /articles/authorize
// Returns ApiResponse<ApiResponse<EvaluationUser>> (nested envelope).
export const authorizeEvaluation = async (
  payload: AuthorizeEvaluationPayload
): Promise<AuthorizeEvaluationResponse> => {
  const { data } = await axiosApi.post<AuthorizeEvaluationResponse>(
    AUTHORIZE_ENDPOINT,
    payload
  )
  return data
}