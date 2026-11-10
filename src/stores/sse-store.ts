import { create } from "zustand"
import type { PrinterStatus } from "@/models/printer-model"
import type { ExitVehicleEvent, LaneAlert } from "@/models/sse-model"

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

  /** Last exit_car / search_car message; a new one replaces the previous. */
  exitEvent: ExitVehicleEvent | null
  setExitEvent: (e: ExitVehicleEvent) => void

  /**
   * Removes one transaction from the last exit_car (after a successful cancel,
   * since no new exit_car follows). Clears the event when none are left.
   */
  removeExitTransaction: (key: string) => void

  /** Last graylist / season parker message; a new one replaces the previous. */
  laneAlert: LaneAlert | null
  setLaneAlert: (a: LaneAlert) => void
  clearLaneAlert: () => void

  /** Clears the vehicle and the alert (used by Clear All). */
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

  // No equality check on the two slots below: they aren't heartbeats, and a
  // repeated message must still count as new (it can reopen a modal).
  exitEvent: null,
  setExitEvent: (e) => set({ exitEvent: e }),

  removeExitTransaction: (key) =>
    set((s) => {
      const e = s.exitEvent
      if (e?.type !== "exit_car") return s

      const transactions = { ...(e.data.transactions ?? {}) }
      delete transactions[key]

      // Last line removed: same as Clear All
      if (Object.keys(transactions).length === 0) {
        return { exitEvent: null, laneAlert: null }
      }
      return {
        exitEvent: { type: "exit_car", data: { ...e.data, transactions } },
      }
    }),

  laneAlert: null,
  setLaneAlert: (a) => set({ laneAlert: a }),
  clearLaneAlert: () =>
    set((s) => (s.laneAlert === null ? s : { laneAlert: null })),

  clearExitEvent: () =>
    set((s) =>
      s.exitEvent === null && s.laneAlert === null
        ? s
        : { exitEvent: null, laneAlert: null }
    ),

  reset: () =>
    set({
      status: "disconnected",
      natsOnline: null,
      printer: null,
      exitEvent: null,
      laneAlert: null,
    }),
}))