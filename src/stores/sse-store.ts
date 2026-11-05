import { create } from "zustand"
import type { PrinterStatus } from "@/models/printer-model"

export type SSEStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"

/** Live printer status plus the backend's human-readable message. */
export type PrinterState = PrinterStatus & { message: string }

interface SSEState {
  status: SSEStatus
  setStatus: (status: SSEStatus) => void

  /** Backend NATS connection; null until the first message arrives. */
  natsOnline: boolean | null
  setNatsOnline: (online: boolean) => void

  printer: PrinterState | null
  setPrinter: (p: PrinterState) => void

  /** Clear live data (used on logout). */
  reset: () => void
}

export const useSSEStore = create<SSEState>((set) => ({
  status: "disconnected",
  setStatus: (status) => set((s) => (s.status === status ? s : { status })),

  natsOnline: null,
  setNatsOnline: (online) =>
    set((s) => (s.natsOnline === online ? s : { natsOnline: online })),

  printer: null,
  setPrinter: (p) =>
    set((s) => {
      const prev = s.printer
      // Skip identical updates so subscribers don't re-render on every heartbeat
      if (prev && (Object.keys(p) as (keyof PrinterState)[]).every((k) => prev[k] === p[k])) {
        return s
      }
      return { printer: p }
    }),

  reset: () =>
    set({ status: "disconnected", natsOnline: null, printer: null }),
}))