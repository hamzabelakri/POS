import { LoginResponse } from "@/models/auth-model";
import { Shift } from "@/models/shift-model";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  hasOpenShift: boolean;
  shift: Shift | null;
  setAuth: (data: LoginResponse | undefined) => void;
  // Pass a shift when one starts or is loaded after login, or null when it is closed.
  setShift: (shift: Shift | null) => void;
  // Clears everything (pause, close, expired session). The open shift is
  // reloaded from GET /shifts/current the next time the cashier signs in.
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      hasOpenShift: false,
      shift: null,
      setAuth: (data) => {
        set({
          token: data?.data?.token ?? null,
          hasOpenShift: data?.data?.has_open_shift ?? false,
        });
      },
      setShift: (shift) => {
        set({ shift, hasOpenShift: shift !== null });
      },
      clearAuth: () => {
        set({
          token: null,
          hasOpenShift: false,
          shift: null,
        });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);