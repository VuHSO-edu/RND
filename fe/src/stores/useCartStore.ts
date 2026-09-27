import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Product } from '../services/heritageApi';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  immer((set, get) => ({
    items: [],

    addToCart: (product: Product) => {
      set((state) => {
        const existing = state.items.find((i) => i.product.id === product.id);
        if (existing) {
          existing.quantity += 1;
        } else {
          state.items.push({ product, quantity: 1 });
        }
      });
    },

    removeFromCart: (productId: number) => {
      set((state) => {
        state.items = state.items.filter((i) => i.product.id !== productId);
      });
    },

    clearCart: () => {
      set((state) => {
        state.items = [];
      });
    },

    getTotalPrice: () => {
      return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
    }
  }))
);
