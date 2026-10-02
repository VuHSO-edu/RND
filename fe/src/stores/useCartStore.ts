import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Product } from '../services/heritageApi';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  immer((set, get) => ({
    items: [],

    addToCart: (product: Product, quantity: number = 1) => {
      set((state) => {
        const existing = state.items.find((i) => i.product.id === product.id);
        if (existing) {
          existing.quantity += quantity;
        } else {
          state.items.push({ product, quantity });
        }
      });
    },

    updateQuantity: (productId: number, quantity: number) => {
      set((state) => {
        const existing = state.items.find((i) => i.product.id === productId);
        if (existing) {
          if (quantity <= 0) {
            state.items = state.items.filter((i) => i.product.id !== productId);
          } else {
            existing.quantity = quantity;
          }
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
