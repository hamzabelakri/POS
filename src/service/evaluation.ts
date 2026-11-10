import axiosApi from '@/lib/axios'
import {
  AuthorizeEvaluationPayload,
  AuthorizeEvaluationResponse,
  EvaluationType,
} from '@/models/evaluation-model'

export const EVALUATION_ENDPOINTS: Record<EvaluationType, string> = {
  article: '/articles/authorize', // adding an article
  barcode: '/user/barcode/open', // barrier actions, shift report amounts
}

// POST /articles/authorize | /user/barcode/open
// Returns ApiResponse<ApiResponse<EvaluationUser>> (nested envelope).
export const authorizeEvaluation = async (
  type: EvaluationType,
  payload: AuthorizeEvaluationPayload
): Promise<AuthorizeEvaluationResponse> => {
  const { data } = await axiosApi.post<AuthorizeEvaluationResponse>(
    EVALUATION_ENDPOINTS[type],
    payload
  )
  return data
}