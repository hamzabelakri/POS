export interface PrintReceiptResponse {
  message: string
}

export interface ReceiptPreviewPayload {
  receipt_header: string
  receipt_body: string
  receipt_footer: string
}

export interface ReceiptPreviewResponse {
  status: number
  data: { image_base64: string }
}