import { create } from "zustand"
import type { PrinterStatus } from "@/models/printer-model"
import { ExitVehicleEvent } from "@/models/consult-model"

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

  /**
   * Last exit-lane message (or manual capture); a new one replaces the previous.
   * Null until received, or after Clear All.
   */
  exitEvent: ExitVehicleEvent | null
  setExitEvent: (e: ExitVehicleEvent) => void
  clearExitEvent: () => void

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

  // No equality check: messages aren't heartbeats, and a repeat of the same
  // message must still count as new (it reopens the plate search modal).
  exitEvent: null,
  setExitEvent: (e) => set({ exitEvent: e }),
  clearExitEvent: () =>
    set((s) => (s.exitEvent === null ? s : { exitEvent: null })),

  reset: () =>
    set({
      status: "disconnected",
      natsOnline: null,
      printer: null,
      exitEvent: null,
    }),
}))