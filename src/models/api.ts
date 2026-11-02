export type ID = undefined | null | number

export interface ApiResponse<T> {
  data: T;
  pagination: PaginationMetadata;
  filters?: FiltersMetadata;
  message: string;
  status: number;
}

// Matches the pagination fields returned by the API (e.g. shift report)
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
  // This allows your other dynamic filters (status, start, end, etc.)
  // to be passed without TypeScript throwing errors.
  [key: string]: any;
}

export interface ApiError {
  status: number;
  error: string;
}