import { createSignal } from "solid-js";
import { Product } from "../types/api";

const STORAGE_KEY = "cart_v1";

export interface CartItem {
  id: string; // composite id productId-sizeId-colorId
  productId: number;
  product?: Product;
  quantity: number;
  sizeId?: number | null;
  colorId?: number | null;
  unitPrice: number;
}

const parseStored = (raw: string | null): CartItem[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [];
};

const [items, setItems] = createSignal<CartItem[]>(
  parseStored(localStorage.getItem(STORAGE_KEY))
);

const persist = (list: CartItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
};

const makeId = (
  productId: number,
  sizeId?: number | null,
  colorId?: number | null
) => `${productId}_${sizeId ?? "-"}_${colorId ?? "-"}`;

const addItem = (payload: {
  productId: number;
  product?: Product;
  quantity?: number;
  sizeId?: number | null;
  colorId?: number | null;
  unitPrice: number;
}) => {
  const q = Math.max(1, Math.floor(payload.quantity ?? 1));
  const id = makeId(payload.productId, payload.sizeId, payload.colorId);
  const list = items().slice();
  const idx = list.findIndex((i) => i.id === id);
  if (idx >= 0) {
    list[idx].quantity = list[idx].quantity + q;
  } else {
    list.push({
      id,
      productId: payload.productId,
      product: payload.product,
      quantity: q,
      sizeId: payload.sizeId ?? null,
      colorId: payload.colorId ?? null,
      unitPrice: payload.unitPrice,
    });
  }
  setItems(list);
  persist(list);
};

const removeItem = (id: string) => {
  const list = items().filter((i) => i.id !== id);
  setItems(list);
  persist(list);
};

const updateQuantity = (id: string, quantity: number) => {
  const q = Math.max(1, Math.floor(quantity));
  const list = items().slice();
  const idx = list.findIndex((i) => i.id === id);
  if (idx >= 0) {
    list[idx].quantity = q;
    setItems(list);
    persist(list);
  }
};

const clear = () => {
  setItems([]);
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
};

const total = () =>
  items().reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);

const count = () => items().reduce((acc, it) => acc + it.quantity, 0);

export const useCart = () => ({
  items,
  addItem,
  removeItem,
  updateQuantity,
  clear,
  total,
  count,
});

export default useCart;
