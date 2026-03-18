import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/lib/mock-data';
import { getProductById } from '@/lib/mock-data';

interface WishlistState {
  items: string[]; // product IDs
  compareItems: string[]; // product IDs for comparison (max 3)

  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getWishlistProducts: () => Product[];

  addToCompare: (productId: string) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  getCompareProducts: () => Product[];
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      compareItems: [],

      addToWishlist: (productId) => {
        const { items } = get();
        if (!items.includes(productId)) {
          set({ items: [...items, productId] });
        }
      },

      removeFromWishlist: (productId) => {
        set({ items: get().items.filter(id => id !== productId) });
      },

      isInWishlist: (productId) => {
        return get().items.includes(productId);
      },

      getWishlistProducts: () => {
        return get().items.map(id => getProductById(id)).filter(Boolean) as Product[];
      },

      addToCompare: (productId) => {
        const { compareItems } = get();
        if (compareItems.length >= 3) return false;
        if (!compareItems.includes(productId)) {
          set({ compareItems: [...compareItems, productId] });
        }
        return true;
      },

      removeFromCompare: (productId) => {
        set({ compareItems: get().compareItems.filter(id => id !== productId) });
      },

      clearCompare: () => set({ compareItems: [] }),

      isInCompare: (productId) => {
        return get().compareItems.includes(productId);
      },

      getCompareProducts: () => {
        return get().compareItems.map(id => getProductById(id)).filter(Boolean) as Product[];
      },
    }),
    { name: 'wishlist-storage' }
  )
);
