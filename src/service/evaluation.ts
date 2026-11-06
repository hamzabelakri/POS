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
  const { data: body } = await axiosApi.post<AuthorizeEvaluationResponse>(
    AUTHORIZE_ENDPOINT,
    payload
  )

  // Only an explicit 200 on both levels counts as authorized.
  if (body.status !== 200 || body.data?.status !== 200) {
    throw new Error(body.data?.message ?? body.message ?? 'Authorization failed')
  }
  return body
}