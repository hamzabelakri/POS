import { Cashier, LoginResponse } from "@/models/auth-model";
import { Shift } from "@/models/shift-model";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  cashier: Cashier | null;
  hasOpenShift: boolean;
  shift: Shift | null;
  setAuth: (data: LoginResponse | undefined) => void;
  setShift: (shift: Shift | null) => void;
  clearAuth: () => void;
}

const emptyAuth = {
  token: null,
  cashier: null,
  hasOpenShift: false,
  shift: null,
} as const;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...emptyAuth,
      setAuth: (res) => {
        const data = res?.data;
        if (!data?.token || !data.cashier) {
          get().clearAuth(); // malformed or missing response: never half-authenticate
          return;
        }
        set({
          token: data.token,
          cashier: data.cashier,
          hasOpenShift: data.has_open_shift,
          shift: null, // reloaded from GET /shifts/current
        });
      },
      setShift: (shift) => set({ shift, hasOpenShift: shift !== null }),
      clearAuth: () => set({ ...emptyAuth }),
    }),
    {
      name: "auth-storage",
      version: 1,
      // Old persisted state has a token but no cashier: force a fresh login.
      migrate: () => ({ ...emptyAuth }),
      partialize: (s) => ({
        token: s.token,
        cashier: s.cashier,
        hasOpenShift: s.hasOpenShift,
        shift: s.shift,
      }),
    }
  )
);