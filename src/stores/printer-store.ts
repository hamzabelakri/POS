import { create } from "zustand"
import { persist } from "zustand/middleware"

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