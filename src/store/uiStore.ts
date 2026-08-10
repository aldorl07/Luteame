// src/store/uiStore.ts
import { create } from "zustand";

interface UIStore {
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  cartOpen: false,
  setCartOpen: (open) => set({ cartOpen: open }),
}));
