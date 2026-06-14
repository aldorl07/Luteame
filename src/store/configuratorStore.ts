// src/store/configuratorStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";

interface ConfiguratorStore {
  activeStep: number;
  selections: (Product | null)[];   // index 0=escritorio, 1=componentes, 2=refrigeracion
  setStep: (step: number) => void;
  selectProduct: (step: number, product: Product) => void;
  clearSelection: (step: number) => void;
  clearAll: () => void;
  totalPrice: number;
}

export const useConfiguratorStore = create<ConfiguratorStore>()(
  persist(
    (set, get) => ({
      activeStep: 0,
      selections: [null, null, null],
      totalPrice: 0,

      setStep: (step) => set({ activeStep: step }),

      selectProduct: (step, product) => {
        const selections = [...get().selections];
        selections[step] = product;
        const total = selections.reduce(
          (sum, p) => sum + (p ? p.precio : 0),
          0
        );
        set({ selections, totalPrice: total });
      },

      clearSelection: (step) => {
        const selections = [...get().selections];
        selections[step] = null;
        const total = selections.reduce(
          (sum, p) => sum + (p ? p.precio : 0),
          0
        );
        set({ selections, totalPrice: total });
      },

      clearAll: () =>
        set({ selections: [null, null, null], totalPrice: 0, activeStep: 0 }),
    }),
    { name: "luteame-configurator" }
  )
);
