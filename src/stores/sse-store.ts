import { create } from "zustand"
import type { PrinterStatus } from "@/models/printer-model"
import type { ExitVehicleEvent, LaneAlert, QueuedLaneAlert } from "@/models/sse-model"

export type SSEStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"

/** Live printer status plus the backend's human-readable message. */
export type PrinterState = PrinterStatus & { message: string }

/** Monotonic id source for open lane alerts (per session, unique enough for keys). */
let nextAlertId = 0

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

  /** Open lane alerts, oldest first; each one is its own modal, so the newest is on top. */
  laneAlerts: QueuedLaneAlert[]
  /** Opens a new alert on top of the existing ones. */
  setLaneAlert: (a: LaneAlert) => void
  /** Closes one alert by id; the others stay open. */
  clearLaneAlert: (id: number) => void

  /** Clears the vehicle and all alerts (used by Clear All). */
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
        return { exitEvent: null, laneAlerts: [] }
      }
      return {
        exitEvent: { type: "exit_car", data: { ...e.data, transactions } },
      }
    }),

  laneAlerts: [],
  setLaneAlert: (a) =>
    set((s) => ({ laneAlerts: [...s.laneAlerts, { ...a, id: ++nextAlertId }] })),
  clearLaneAlert: (id) =>
    set((s) =>
      s.laneAlerts.some((a) => a.id === id)
        ? { laneAlerts: s.laneAlerts.filter((a) => a.id !== id) }
        : s
    ),

  clearExitEvent: () =>
    set((s) =>
      s.exitEvent === null && s.laneAlerts.length === 0
        ? s
        : { exitEvent: null, laneAlerts: [] }
    ),

  reset: () =>
    set({
      status: "disconnected",
      natsOnline: null,
      printer: null,
      exitEvent: null,
      laneAlerts: [],
    }),
}))