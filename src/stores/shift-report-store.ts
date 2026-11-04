import { create } from "zustand";
import {
  ShiftReportDialogEnum,
  ShiftReportQueryParams,
} from "@/models/shift-report-model";

interface ShiftReportState {
  open: ShiftReportDialogEnum | null;
  setOpen: (open: ShiftReportDialogEnum | null) => void;


  queryParams: ShiftReportQueryParams;
  setQueryParams: (params: Partial<ShiftReportQueryParams>) => void;

  resetFilterQueryParams: () => void;
}

export const useShiftReportStore = create<ShiftReportState>((set) => ({
  open: null,
  setOpen: (open) => set({ open }),


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