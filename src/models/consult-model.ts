export interface SearchParams {
  license_plate?: string;
  from: string; // ISO 8601, e.g. 2026-11-02T23:00:00.000Z
  to: string;
  page: number;
  page_size: number;
  lane_id?: number; // omitted when "All" is selected
}

export interface SearchCar {
  image: string;
  image_id: string;
  external_unique_id: string; // EPAN
  license_plate: string;
  card_type: string;
  entry_unit: number;
  entry_time: string; // "2026-09-01 08:22:04"
}

export interface SearchData {
  cars: SearchCar[] | null;
  current_page: number;
  page_size: number;
  total_pages: number;
}

// This endpoint does not use the ApiResponse<T> wrapper.
export interface SearchResponse {
  status: number;
  data: SearchData;
}

// Placeholder until the consult response shape is defined.
export type ConsultResponse = Record<string, unknown>;