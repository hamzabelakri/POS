import { ApiResponse } from '@/models/api'

export interface AuthorizeEvaluationPayload {
  evaluation_password: string
}

export interface EvaluationRole {
  role_id: number
  role_name: string
  // CRUD-style flags per module, e.g. "1111"
  permissions: Record<string, string>
  user_count: number
  created_at: string
  updated_at: string
}

export interface EvaluationUser {
  id: number
  first_name: string
  last_name: string
  email: string
  rfid_card: string | null
  barcode: string
  is_active: boolean
  Role: EvaluationRole // capital R, as the backend sends it
  role_id: number
  created_at: string
  updated_at: string
}


// Which backend check the password is validated against
export type EvaluationType = 'article' | 'barcode'


// POST evaluation authorize => the API nests a second envelope inside `data`:
// { status, message, data: { status, message, data: EvaluationUser } }
export type AuthorizeEvaluationResponse = ApiResponse<ApiResponse<EvaluationUser>>