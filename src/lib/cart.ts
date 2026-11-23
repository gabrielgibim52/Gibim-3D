"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MaterialId, SizeOption } from "./catalog";

export type CartItem = {
  key: string;
  slug: string;
  name: string;
  colorId: string;
  colorName: string;
  colorHex: string;
  secondaryColorName?: string;
  materialId: MaterialId;
  materialName: string;
  size: SizeOption["id"];
  text?: string;
  glow?: boolean;
  unitPrice: number;
  qty: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  add: (item: Omit<CartItem, "key" | "qty">, qty?: number) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

function itemKey(item: Omit<CartItem, "key" | "qty">) {
  return [item.slug, item.colorId, item.secondaryColorName, item.materialId, item.size, item.text, item.glow]
    .map((v) => v ?? "")
    .join("|");
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (item, qty = 1) =>
        set((state) => {
          const key = itemKey(item);
          const existing = state.items.find((i) => i.key === key);
          const items = existing
            ? state.items.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i))
            : [...state.items, { ...item, key, qty }];
          return { items, isOpen: true };
        }),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      setQty: (key, qty) =>
        set((s) => ({
          items: qty <= 0 ? s.items.filter((i) => i.key !== key) : s.items.map((i) => (i.key === key ? { ...i, qty } : i)),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: "gibim-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
      skipHydration: true,
    },
  ),
);

export function cartCount(items: CartItem[]) {
  return items.reduce((n, i) => n + i.qty, 0);
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((n, i) => n + i.qty * i.unitPrice, 0);
}
