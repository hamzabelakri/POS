export type ID = undefined | null | number

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
  pagination?: PaginationMetadata;   
  filters?: FiltersMetadata;        
}

export interface PaginationMetadata {
  current_page: number;
  page_size: number;
  total_rows: number;
  total_pages: number;
}

export interface FiltersMetadata {
  modules: string[];
  actions: string[];
}

export interface ApiSearchParams {
  search?: string;
  page?: number;
  page_size?: number;
  [key: string]: any;
}

export interface ApiError {
  status: number;
  error: string;
}