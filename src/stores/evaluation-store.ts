import { create } from "zustand";

interface EvaluationState {
  // true once the evaluation password has been validated
  // (not persisted: a page refresh locks everything again)
  isEvaluated: boolean;
  setEvaluated: (evaluated: boolean) => void;
}

export const useEvaluationStore = create<EvaluationState>((set) => ({
  isEvaluated: false,
  setEvaluated: (evaluated) => set({ isEvaluated: evaluated }),
}));