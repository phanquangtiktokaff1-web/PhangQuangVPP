import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, Address, PaymentMethod, ShippingMethod } from '@/lib/mock-data';
import { getProductById } from '@/lib/mock-data';
import { api } from '@/lib/api';

interface CartState {
  items: CartItem[];
  shippingAddress: Address | null;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  voucherCode: string;
  voucherDiscount: number;
  note: string;

  addItem: (productId: string, quantity?: number, customization?: { type: string; text: string }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setShippingAddress: (address: Address) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setShippingMethod: (method: ShippingMethod) => void;
  applyVoucher: (code: string) => Promise<boolean>;
  removeVoucher: () => void;
  setNote: (note: string) => void;

  getCartProducts: () => (CartItem & { product: Product })[];
  getSubtotal: () => number;
  getShippingFee: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      shippingAddress: null,
      paymentMethod: 'cod',
      shippingMethod: 'standard',
      voucherCode: '',
      voucherDiscount: 0,
      note: '',

      addItem: (productId, quantity = 1, customization) => {
        const { items } = get();
        const existing = items.find(i => i.productId === productId);
        if (existing) {
          set({
            items: items.map(i =>
              i.productId === productId
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, { productId, quantity, customization }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(i => i.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map(i =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => {
        set({ items: [], voucherCode: '', voucherDiscount: 0, note: '' });
      },

      setShippingAddress: (address) => set({ shippingAddress: address }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setShippingMethod: (method) => set({ shippingMethod: method }),

      applyVoucher: async (code) => {
        const normalized = code.toUpperCase();
        try {
          const subtotal = get().getSubtotal();
          const { data } = await api.post('/vouchers/validate', { code: normalized, subtotal });
          if (data?.valid) {
            set({ voucherCode: normalized, voucherDiscount: Number(data.discount || 0) });
            return true;
          }
          return false;
        } catch (_error) {
          // Fallback to local mock rules if backend is unavailable.
          const vouchers: Record<string, number> = {
            'WELCOME20K': 20000,
            'SAVE15K': 15000,
            'SALE10': 0.1,
            'BULK20': 0.2,
          };
          const discount = vouchers[normalized];
          if (discount !== undefined) {
            const subtotal = get().getSubtotal();
            const actualDiscount = discount < 1 ? Math.min(subtotal * discount, 50000) : discount;
            set({ voucherCode: normalized, voucherDiscount: actualDiscount });
            return true;
          }
          return false;
        }
      },

      removeVoucher: () => set({ voucherCode: '', voucherDiscount: 0 }),
      setNote: (note) => set({ note }),

      getCartProducts: () => {
        return get().items.map(item => {
          const product = getProductById(item.productId);
          return { ...item, product: product! };
        }).filter(item => item.product);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const product = getProductById(item.productId);
          if (!product) return total;
          const price = product.isFlashSale && product.flashSalePrice
            ? product.flashSalePrice
            : product.price;
          return total + price * item.quantity;
        }, 0);
      },

      getShippingFee: () => {
        const { shippingMethod } = get();
        const subtotal = get().getSubtotal();
        if (subtotal >= 500000) return 0; // Free shipping for orders >= 500k
        switch (shippingMethod) {
          case 'express': return 35000;
          case 'same_day': return 50000;
          default: return 25000;
        }
      },

      getTotal: () => {
        return get().getSubtotal() + get().getShippingFee() - get().voucherDiscount;
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    { name: 'cart-storage' }
  )
);
