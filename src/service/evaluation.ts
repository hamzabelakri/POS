import axiosApi from '@/lib/axios'
import {
  AuthorizeEvaluationPayload,
  AuthorizeEvaluationResponse,
} from '@/models/evaluation-model'

// This endpoint lives on a different host/port than the shifts API.
// An absolute URL overrides the axios baseURL. Move it to your env config.
const ARTICLES_API_URL = 'http://20.0.1.172:82/api'

export const authorizeEvaluation = async (
  payload: AuthorizeEvaluationPayload
): Promise<AuthorizeEvaluationResponse> => {
  const response = await axiosApi.post(
    `${ARTICLES_API_URL}/articles/authorize`,
    payload
  )
  const body: AuthorizeEvaluationResponse = response?.data

  // Only an explicit 200 on both levels counts as authorized.
  if (body?.status !== 200 || body?.data?.status !== 200) {
    throw new Error(body?.data?.message ?? 'Authorization failed')
  }
  return body
}