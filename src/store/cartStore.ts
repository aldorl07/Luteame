// src/store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
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
        const items = [...get().items];
        const existingIdx = items.findIndex((i) => i.id === item.id);

        if (existingIdx > -1) {
          // If product exists, increment quantity and recalculate priceTotal
          items[existingIdx].cantidad += item.cantidad;
          items[existingIdx].precioTotal = items[existingIdx].cantidad * items[existingIdx].precioUnitario;
        } else {
          // Add new item
          items.push({
            ...item,
            precioTotal: item.cantidad * item.precioUnitario,
          });
        }

        const itemCount = items.reduce((sum, i) => sum + i.cantidad, 0);
        const total = items.reduce((sum, i) => sum + i.precioTotal, 0);

        set({ items, itemCount, total });
      },

      removeItem: (id) => {
        const items = get().items.filter((i) => i.id !== id);
        const itemCount = items.reduce((sum, i) => sum + i.cantidad, 0);
        const total = items.reduce((sum, i) => sum + i.precioTotal, 0);

        set({ items, itemCount, total });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        const items = get().items.map((item) => {
          if (item.id === id) {
            const updatedQty = quantity;
            return {
              ...item,
              cantidad: updatedQty,
              precioTotal: updatedQty * item.precioUnitario,
            };
          }
          return item;
        });

        const itemCount = items.reduce((sum, i) => sum + i.cantidad, 0);
        const total = items.reduce((sum, i) => sum + i.precioTotal, 0);

        set({ items, itemCount, total });
      },

      clearCart: () => set({ items: [], itemCount: 0, total: 0 }),
    }),
    { name: "luteame-cart-v2" }
  )
);

