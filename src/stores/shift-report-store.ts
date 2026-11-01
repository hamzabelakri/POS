import { create } from "zustand";
import {
  ShiftReportDialogEnum,
  ShiftReportQueryParams,
} from "@/models/shift-report-model";

interface ShiftReportState {
  open: ShiftReportDialogEnum | null;
  setOpen: (open: ShiftReportDialogEnum | null) => void;

  // amount KPIs are hidden until the evaluation password is validated
  // (not persisted: a page refresh locks them again)
  isAmountsUnlocked: boolean;
  setAmountsUnlocked: (unlocked: boolean) => void;

  queryParams: ShiftReportQueryParams;
  setQueryParams: (params: Partial<ShiftReportQueryParams>) => void;

  resetFilterQueryParams: () => void;
}

export const useShiftReportStore = create<ShiftReportState>((set) => ({
  open: null,
  setOpen: (open) => set({ open }),

  isAmountsUnlocked: false,
  setAmountsUnlocked: (unlocked) => set({ isAmountsUnlocked: unlocked }),

  queryParams: {},
  setQueryParams: (params) =>
    set((state) => ({
      queryParams: { ...state.queryParams, ...params },
    })),

  resetFilterQueryParams: () =>
    set((state) => ({
      queryParams: {
        lpn: state.queryParams.lpn,
        page: 1,
        page_size: state.queryParams.page_size,
      },
    })),
}));