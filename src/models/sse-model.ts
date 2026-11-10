// src/models/sse-model.ts

/* ───────── Exit vehicle (exit_car / search_car) ───────── */

export type ExitCarTransaction = {
  code: string
  type: string
  value: number
  is_discount: boolean
  discount_type: string
  discount_value: number
  permission_required: boolean
  admin_id: number
}

export type ExitCar = {
  vehicle_info: {
    image: string
    entry_image: string
    media: { lpn: string }
    card_type: string
    entry_time: string
    tariff_time: string
    parking_duration: string
    external_unique_id: string
  }
  transactions: Record<string, ExitCarTransaction> | null
  payment_summary: {
    subtotal: number
    discounts: number
    tax_rate: number
    tax_value: number
    total: number
    is_cancelled: boolean
    tariff_relev_time: string
  }
  applied_article: {
    name: string
    description: string
    code: string
    admin_id: number
  }
  cashier: { name: string; shift_id: number }
  is_untracked: boolean
}

export type SearchCarData = {
  license_plate: string
  bucket: ExitCar
  cars: unknown[]
  total_pages: number
}

export type ExitVehicleEvent =
  | { type: "exit_car"; data: ExitCar }
  | { type: "search_car"; data: SearchCarData }

/** Flat shape the vehicle card renders, whatever message produced it. */
export type VehicleView = {
  plate: string
  image: string | null
  entryImage: string | null
  epan: string
  cardType: string
  entryTime: string
  parkingDuration: string
  hasEntry: boolean
}

/* ───────── Lane alerts (graylist / season parker) ───────── */

export type GraylistEntry = {
  id: number
  lpn: string
  lpn_en: string
  person_name: string
  car_model: string
  block_entry: boolean
  block_exit: boolean
  reason: string
  created_at: string
  last_seen: string
}

export type GraylistResult = {
  found: boolean
  entry?: GraylistEntry
  block_entry: boolean
  block_exit: boolean
  /** Data URL, may be empty */
  image: string
  /** Seconds (the sample sends 20); likely how long to show the alert */
  time: number
}

export type SeasonParker = {
  participant_id: number
  company_id: number
  participant_first_name: string
  participant_last_name: string
  card_number: string
  lpn: string[]
  neutral: number
  blocked: boolean
  validity_start: string
  validity_end: string
  facility_present: number
  epan: string
}

export type SeasonParkerStatus = {
  state: "season_parker_valid" | "season_parker_not_valid" | (string & {})
  season_parker: SeasonParker
  image: string
}

/** graylist_season_parker: both checks in one message */
export type GraylistSeasonParkerData = {
  graylist: GraylistResult
  season_parker: SeasonParkerStatus
}

/** graylist_exited_with_zero_payment: car left for free (e.g. reason "grace_time") */
export type GraylistExitedZeroPaymentData = {
  graylist: GraylistResult
  bucket: ExitCar
  reason: string
}

/** Latest alert from the exit lane; `message` is the backend's human-readable text. */
export type LaneAlert =
  | { type: "graylist_lpn"; data: GraylistResult; message: string }
  | { type: "graylist_season_parker"; data: GraylistSeasonParkerData; message: string }
  | { type: "season_parker_status"; data: SeasonParkerStatus; message: string }
  | {
      type: "graylist_exited_with_zero_payment"
      data: GraylistExitedZeroPaymentData
      message: string
    }

/* ───────── Helpers ───────── */

/**
 * Returns the src if it holds real image data, otherwise null.
 * The backend sends "data:image/png;base64," (empty payload) when there is no image.
 */
export function toImageSrc(src?: string | null): string | null {
  if (!src) return null
  const marker = "base64,"
  const i = src.indexOf(marker)
  if (i !== -1 && src.length === i + marker.length) return null
  return src
}

export function toVehicleView(e: ExitVehicleEvent | null): VehicleView | null {
  if (!e) return null
  const car = e.type === "search_car" ? e.data.bucket : e.data
  const v = car.vehicle_info
  return {
    plate: v.media.lpn,
    image: toImageSrc(v.image),
    entryImage: toImageSrc(v.entry_image),
    epan: v.external_unique_id,
    cardType: v.card_type,
    // Go's zero time means "no entry"
    entryTime: v.entry_time.startsWith("0001-") ? "" : v.entry_time,
    parkingDuration: v.parking_duration,
    hasEntry: !car.is_untracked,
  }
}