import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wishlistApi, type Product } from '@/lib/api-service';
import { useAuthStore } from './auth-store';

interface WishlistState {
  productIds: string[];
  products: Product[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  fetchWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      products: [],

      fetchWishlist: async () => {
        try {
          const { isAuthenticated } = useAuthStore.getState();
          if (!isAuthenticated) return;
          const products = await wishlistApi.getAll();
          set({ products, productIds: products.map(p => p.id) });
        } catch { /* ignore */ }
      },

      addToWishlist: async (productId) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;
        try {
          await wishlistApi.add(productId);
          if (!get().productIds.includes(productId)) {
            set({ productIds: [...get().productIds, productId] });
          }
        } catch { /* ignore */ }
      },

      removeFromWishlist: async (productId) => {
        try {
          await wishlistApi.remove(productId);
          set({
            productIds: get().productIds.filter(id => id !== productId),
            products: get().products.filter(p => p.id !== productId),
          });
        } catch { /* ignore */ }
      },

      isInWishlist: (productId) => get().productIds.includes(productId),
    }),
    { name: 'wishlist-store', partialize: (s) => ({ productIds: s.productIds }) }
  )
);
