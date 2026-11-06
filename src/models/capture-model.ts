export type CaptureResponse = {
  image: string
  lpn_q: number
  media: {
    lpn: string
    barcode: string
    rfid: string
    uhf: string
    external_unique_id: string
    oa: string
  }
  image_id: string
}