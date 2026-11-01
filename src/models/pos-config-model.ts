export interface PosConfigPayload {
  base_url: string;
  pos_token: string;
}

// `save: false` => test the connection only, `save: true` => test and persist.
export interface ConfigurePosVariables {
  payload: PosConfigPayload;
  save: boolean;
}

export interface PosInfo {
  id: number;
  name: string;
  pos_token: string;
  pos_base_url: string;
  backoffice_base_url: string;
  facility_id: string;
  consumer_id: string;
  standalone: boolean;
  payment_method: string;
  with_barrier: boolean;
  products: unknown[] | null;
  camera_id: number;
  camera_name: string;
  exit_lane_id: number;
  exit_direction: string;
  virtual_entry_camera_id: number;
  virtual_entry_lane_id: number;
  virtual_entry_direction: string;
  carpark_id: number;
  carpark_name: string;
  unit_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  zero_payment_timeout_popup: number;
  season_parker_exit_timeout_popup: number;
  timezone: string;
}

export interface Carpark {
  id: number;
  carpark_name: string;
  operator_id: number;
  pms_type: string;
  currency: string;
  denominator: number;
  separator: string;
  nats_url: string;
  date_format: string;
  facilities: unknown[] | null;
  created_at: string;
  updated_at: string;
}

export interface CarparkSettings {
  carpark_id: number;
  zr_id: number;
  protocol: string;
  ip_address: string;
  port: number;
  ves_api_key: string;
  epan_prefix: string;
  vat: number;
  print_shift_report: string;
  unpaid_grace_time: number;
  paid_grace_time: number;
}

export interface CarparkReceiptSettings {
  carpark_id: number;
  receipt_header: string;
  receipt_body: string;
  receipt_footer: string;
}

export interface CarparkExtraSettings {
  carpark_id: number;
  ui_username: string;
  ui_password: string;
  db_ip: string;
  db_port: number;
  db_sid: string;
  db_user: string;
  db_password: string;
}

export interface PosCamera {
  id: number;
  name: string;
  type: string;
  ip: string;
  port: number;
  username: string;
  password: string;
  created_at: string;
  updated_at: string;
  last_connection: string;
  is_active: boolean;
  lane_id: number;
  timeout: number;
  soft_trigger: boolean;
  pms: unknown | null;
  camera_mode: string;
  min_confidence: number;
  no_lpn_default_value: string;
  lane_type: string;
  carpark_id: number;
}

// NOTE: this endpoint does not use the ApiResponse<T> wrapper.
export interface PosConfigResponse {
  pos: PosInfo;
  carpark: Carpark;
  carpark_settings: CarparkSettings;
  carpark_receipt_settings: CarparkReceiptSettings;
  carpark_extra_settings: CarparkExtraSettings;
  camera: PosCamera;
  cashiers: unknown[] | null;
  cameras: PosCamera[] | null;
}

export interface PosConfigError {
  status: number;
  error: string;
}