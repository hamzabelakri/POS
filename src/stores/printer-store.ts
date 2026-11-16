import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useSSEStore, type PrinterState } from '@/stores/sse-store'
import { useTranslation } from "react-i18next"

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

type Translator = (key: string, options?: Record<string, unknown>) => string

// Order matters: an offline printer also reports cover/paper as false.
export function getPrinterUi(
  p: PrinterState | null,
  t?: Translator
): PrinterUi {
  const tr: Translator = t ?? ((key) => key) // fallback: return the key as-is

  if (!p) return { label: tr('print'), blocked: false } // unknown: let the backend decide
  if (!p.online) return { label: tr('printer_offline'), blocked: true }
  if (p.error) return { label: tr('printer_error'), blocked: true }
  if (!p.cover_closed) return { label: tr('printer_cover_open'), blocked: true }
  if (!p.paper_ok) return { label: tr('printer_no_paper'), blocked: true }
  if (p.paper_low) return { label: tr('printer_paper_low'), blocked: false }
  return { label: tr('print'), blocked: false }
}

// Only trust the printer status while the SSE stream is live
export function usePrinterUi(): PrinterUi {
  const connected = useSSEStore((s) => s.status === 'connected')
  const printer = useSSEStore((s) => s.printer)
  const { t } = useTranslation() 
  return getPrinterUi(connected ? printer : null, t)
}