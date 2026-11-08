export type ID = undefined | null | number

export interface ApiResponse<T> {
  status: number
  message?: string
  data: T
}

export interface PaginationMetadata {
  current_page: number
  page_size: number
  total_pages: number
  total_rows?: number
}

export type PaginatedData<T> = T & PaginationMetadata

export interface ApiSearchParams {
  search?: string
  page?: number
  page_size?: number
  [key: string]: any
}

export interface ApiError {
  status: number
  error: string
}