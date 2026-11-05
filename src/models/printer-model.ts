export interface PrintReceiptResponse {
  message: string
}

export interface ConfigReceiptPreviewPayload {
  receipt_header: string
  receipt_body: string
  receipt_footer: string
}

export interface ReceiptPreviewResponse {
  status: number
  data: { image_base64: string }
}

export interface PrinterStatus {
  online: boolean
  cover_closed: boolean
  paper_ok: boolean
  paper_low: boolean
  error: boolean
  error_code: number
}