import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null, // { _id, username, email, role, volunteerId, token }
            token: null,
            login: (userData) => set({ user: userData, token: userData.token }),
            logout: () => set({ user: null, token: null }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
