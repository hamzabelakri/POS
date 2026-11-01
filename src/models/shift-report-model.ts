export type PaymentMethod = 'cash' | 'card' | (string & {})

export interface ShiftReportRow {
  payment_id: number
  card_type: string
  media: Record<string, unknown>
  total: number
  payment_method: PaymentMethod
  entry_time: string
}

export interface ShiftReportData {
  current_page: number
  page_size: number
  shift_report_rows: ShiftReportRow[]
  total_cash: number
  total_pages: number
  total_rows: number
  total_turnover: number
}

// This endpoint wraps everything (rows + pagination + totals) inside `data`,
// so it does not fit the shared ApiResponse<T[]> shape.
export interface ShiftReportResponse {
  status: number
  message?: string
  data: ShiftReportData
}

// Query params are sent to the API as-is (same names as the endpoint)
export interface ShiftReportQueryParams {
  lpn?: string
  page?: number
  page_size?: number
}

// Dialogs that can be opened from the shift report page
export enum ShiftReportDialogEnum {
  EVALUATION = 'evaluation',
}