// src/store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      total: 0,

      addItem: (item) => {
        const existing = get().items.find((i) => i.productId === item.productId);
        if (existing) return; // no duplicates
        const newItems = [...get().items, item];
        set({
          items: newItems,
          itemCount: newItems.length,
          total: newItems.reduce((sum, i) => sum + i.precio, 0),
        });
      },

      removeItem: (productId) => {
        const newItems = get().items.filter((i) => i.productId !== productId);
        set({
          items: newItems,
          itemCount: newItems.length,
          total: newItems.reduce((sum, i) => sum + i.precio, 0),
        });
      },

      clearCart: () => set({ items: [], itemCount: 0, total: 0 }),
    }),
    { name: "luteame-cart" }
  )
);
