export interface AuthorizeEvaluationPayload {
  evaluation_password: string
}

export interface EvaluationUser {
  id: number
  first_name: string
  last_name: string
  email: string
  is_active: boolean
  role_id: number
}

// The API nests a second { status, data, message } object inside `data`.
export interface AuthorizeEvaluationResponse {
  status: number
  data: {
    status: number
    data: EvaluationUser
    message: string
  }
}