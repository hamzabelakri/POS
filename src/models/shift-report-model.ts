import { ApiResponse, PaginatedData } from '@/models/api'

export type PaymentMethod = 'cash' | 'card' | '' | (string & {})

export interface ShiftReportMedia {
  lpn?: string
  [key: string]: unknown
}

export interface ShiftReportRow {
  payment_id: number
  card_type: string
  media: ShiftReportMedia
  total: number
  payment_method: PaymentMethod
  entry_time: string
}

export interface ShiftReportData {
  shift_report_rows: ShiftReportRow[]
  total_cash: number
  total_turnover: number
}

export type ShiftReportResponse = ApiResponse<PaginatedData<ShiftReportData>>

export interface ShiftReportQueryParams {
  lpn?: string
  page?: number
  page_size?: number
}

export enum ShiftReportDialogEnum {
  EVALUATION = 'evaluation',
}