import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PosConfigData } from "@/models/pos-config-model";

interface PosConfigState {
  isConfigured: boolean;
  config: PosConfigData | null;
  setConfig: (config: PosConfigData) => void;
  clearConfig: () => void;
}

export const usePosConfigStore = create<PosConfigState>()(
  persist(
    (set) => ({
      isConfigured: false,
      config: null,
      setConfig: (config) => set({ config, isConfigured: true }),
      clearConfig: () => set({ config: null, isConfigured: false }),
    }),
    { name: "pos-config-storage" }
  )
);

// For route guards outside React (e.g. beforeLoad).
export const isPosConfigured = () => usePosConfigStore.getState().isConfigured;