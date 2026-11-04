import { create } from "zustand"
import { endOfDay, startOfDay } from "date-fns"
import { type DateRange } from "react-day-picker"
import { PlateSearchQueryParams } from "@/models/consult-model"

const PLATE_SLOTS = 8
const PAGE_SIZE = 5

const emptyPlate = () => Array<string>(PLATE_SLOTS).fill("")
const todayRange = (): DateRange => ({
  from: startOfDay(new Date()),
  to: endOfDay(new Date()),
})

interface PlateSearchState {
  open: boolean
  setOpen: (open: boolean) => void

  plate: string[]
  setPlateChar: (index: number, value: string) => void

  range: DateRange | undefined
  setRange: (range: DateRange | undefined) => void

  // null until the first search; changing it triggers the fetch
  queryParams: PlateSearchQueryParams | null
  search: () => void
  setPage: (page: number) => void
}

export const usePlateSearchStore = create<PlateSearchState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),

  plate: emptyPlate(),
  setPlateChar: (index, value) =>
    set((state) => ({
      plate: state.plate.map((char, i) => (i === index ? value : char)),
    })),

  range: todayRange(),
  setRange: (range) => set({ range }),

  queryParams: null,
  search: () =>
    set((state) => {
      const { plate, range } = state
      const from = range?.from
      // a single-day pick has no `to`: fall back to the end of that day
      const to = range?.to ?? (from ? endOfDay(from) : undefined)
      return {
        queryParams: {
          license_plate: plate.join("").trim().toUpperCase() || undefined,
          from: from?.toISOString(),
          to: to?.toISOString(),
          page: 1,
          page_size: PAGE_SIZE,
        },
      }
    }),
  setPage: (page) =>
    set((state) =>
      state.queryParams
        ? { queryParams: { ...state.queryParams, page } }
        : state
    ),
}))