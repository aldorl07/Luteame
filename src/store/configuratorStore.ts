// src/store/configuratorStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, NecesidadUso, PresupuestoRango, CompatibilityReport } from "@/types";
import { checkCompatibility } from "@/lib/compatibilityRules";

interface ConfiguratorStore {
  activeStep: number;
  usoRecomendado: NecesidadUso | null;
  presupuestoRango: PresupuestoRango | null;
  selections: Record<string, Product | null>;
  compatibility: CompatibilityReport;
  totalPrice: number;
  setStep: (step: number) => void;
  setUsoYPresupuesto: (uso: NecesidadUso, presupuesto: PresupuestoRango) => void;
  selectProduct: (category: string, product: Product) => void;
  clearSelection: (category: string) => void;
  clearAll: () => void;
  setRecommendedSetup: (setup: Record<string, Product>) => void;
}

const INITIAL_SELECTIONS: Record<string, Product | null> = {
  procesadores: null,
  placas: null,
  ram: null,
  graficas: null,
  almacenamiento: null,
  fuentes: null,
  gabinetes: null,
  refrigeracion: null,
  escritorios: null,
};

export const useConfiguratorStore = create<ConfiguratorStore>()(
  persist(
    (set, get) => ({
      activeStep: 0,
      usoRecomendado: null,
      presupuestoRango: null,
      selections: INITIAL_SELECTIONS,
      compatibility: { compatible: true, warnings: [] },
      totalPrice: 0,

      setStep: (step) => set({ activeStep: step }),

      setUsoYPresupuesto: (uso, presupuesto) => {
        set({ usoRecomendado: uso, presupuestoRango: presupuesto });
      },

      selectProduct: (category, product) => {
        const selections = { ...get().selections, [category]: product };
        const totalPrice = Object.values(selections).reduce(
          (sum, p) => sum + (p ? p.precio : 0),
          0
        );
        const compatibility = checkCompatibility(selections);
        set({ selections, totalPrice, compatibility });
      },

      clearSelection: (category) => {
        const selections = { ...get().selections, [category]: null };
        const totalPrice = Object.values(selections).reduce(
          (sum, p) => sum + (p ? p.precio : 0),
          0
        );
        const compatibility = checkCompatibility(selections);
        set({ selections, totalPrice, compatibility });
      },

      clearAll: () =>
        set({
          activeStep: 0,
          usoRecomendado: null,
          presupuestoRango: null,
          selections: { ...INITIAL_SELECTIONS },
          compatibility: { compatible: true, warnings: [] },
          totalPrice: 0,
        }),

      setRecommendedSetup: (setup) => {
        const selections = { ...INITIAL_SELECTIONS, ...setup };
        const totalPrice = Object.values(selections).reduce(
          (sum, p) => sum + (p ? p.precio : 0),
          0
        );
        const compatibility = checkCompatibility(selections);
        set({ selections, totalPrice, compatibility });
      },
    }),
    { name: "luteame-configurator-v2" }
  )
);

