import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Address } from '@/lib/mock-data';
import { mockUsers } from '@/lib/mock-data';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithFacebook: () => Promise<boolean>;
  register: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, _password: string) => {
        // Mock login - find user by email
        const user = mockUsers.find(u => u.email === email);
        if (user) {
          set({ user, isAuthenticated: true });
          return true;
        }
        // Default: login as customer
        if (email && _password) {
          const defaultUser: User = {
            id: 'user-2',
            email,
            name: 'Nguyễn Văn A',
            phone: '0912345678',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nguyen',
            role: 'customer',
            status: 'active',
            createdAt: new Date().toISOString(),
            addresses: [
              { id: 'addr-2', name: 'Nguyễn Văn A', phone: '0912345678', street: '456 Lê Lợi', ward: 'Phường 1', district: 'Quận 3', city: 'TP. Hồ Chí Minh', isDefault: true },
            ],
          };
          set({ user: defaultUser, isAuthenticated: true });
          return true;
        }
        return false;
      },

      loginWithGoogle: async () => {
        const user = mockUsers[1]; // customer user
        set({ user, isAuthenticated: true });
        return true;
      },

      loginWithFacebook: async () => {
        const user = mockUsers[1]; // customer user
        set({ user, isAuthenticated: true });
        return true;
      },

      register: async (name: string, email: string, _password: string, phone: string) => {
        const newUser: User = {
          id: `user-${Date.now()}`,
          email,
          name,
          phone,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
          role: 'customer',
          status: 'active',
          createdAt: new Date().toISOString(),
          addresses: [],
        };
        set({ user: newUser, isAuthenticated: true });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (data) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...data } });
        }
      },

      changePassword: async (_oldPassword: string, _newPassword: string) => {
        // Mock password change
        return true;
      },

      addAddress: (address) => {
        const { user } = get();
        if (user) {
          const newAddress: Address = { ...address, id: `addr-${Date.now()}` };
          set({ user: { ...user, addresses: [...user.addresses, newAddress] } });
        }
      },

      updateAddress: (id, address) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              addresses: user.addresses.map(a => a.id === id ? { ...a, ...address } : a),
            },
          });
        }
      },

      deleteAddress: (id) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, addresses: user.addresses.filter(a => a.id !== id) } });
        }
      },

      setDefaultAddress: (id) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              addresses: user.addresses.map(a => ({ ...a, isDefault: a.id === id })),
            },
          });
        }
      },
    }),
    { name: 'auth-storage' }
  )
);
