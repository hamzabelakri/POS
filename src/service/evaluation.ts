import axiosApi from '@/lib/axios'
import {
  AuthorizeEvaluationPayload,
  AuthorizeEvaluationResponse,
  EvaluationType,
} from '@/models/evaluation-model'

export const EVALUATION_ENDPOINTS: Record<EvaluationType, string> = {
  article: '/articles/authorize',
  barrier: '/barriers/authorize',
  shift: '/shifts/authorize',
}

export const BARCODE_OPEN_ENDPOINT = '/user/barcode/open'

// POST /articles/authorize | /barriers/authorize | /shifts/authorize
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

// POST /user/barcode/open: sent when an evaluation modal opens
// (fire-and-forget, the response is discarded).
export const openBarcode = async (): Promise<void> => {
  await axiosApi.post(BARCODE_OPEN_ENDPOINT)
}