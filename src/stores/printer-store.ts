import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useSSEStore, type PrinterState } from '@/stores/sse-store'

interface AutoPrintState {
  autoPrint: boolean
  toggleAutoPrint: () => void
}

export const useAutoPrintStore = create<AutoPrintState>()(
  persist(
    (set) => ({
      autoPrint: false,
      toggleAutoPrint: () => set((s) => ({ autoPrint: !s.autoPrint })),
    }),
    { name: "auto-print-storage" }
  )
)



export type PrinterUi = { label: string; blocked: boolean }

// Order matters: an offline printer also reports cover/paper as false.
export function getPrinterUi(p: PrinterState | null): PrinterUi {
  if (!p) return { label: 'Print', blocked: false } // unknown: let the backend decide
  if (!p.online) return { label: 'Offline', blocked: true }
  if (p.error) return { label: 'Error', blocked: true }
  if (!p.cover_closed) return { label: 'Cover Open', blocked: true }
  if (!p.paper_ok) return { label: 'No Paper', blocked: true }
  if (p.paper_low) return { label: 'Paper Low', blocked: false }
  return { label: 'Print', blocked: false }
}

// Only trust the printer status while the SSE stream is live
export function usePrinterUi(): PrinterUi {
  const connected = useSSEStore((s) => s.status === 'connected')
  const printer = useSSEStore((s) => s.printer)
  return getPrinterUi(connected ? printer : null)
}