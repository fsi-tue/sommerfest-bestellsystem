import { create } from "zustand/index";
import { createJSONStorage, persist } from 'zustand/middleware'

interface AuthState {
    isSignedIn: boolean;
    signIn: () => void;
    signOut: () => void;
}

const useAuthStore = create<AuthState>()(persist(
    (set, get) => ({
        isSignedIn: false,
        signIn: () => set({ isSignedIn: true }),
        signOut: () => set({ isSignedIn: false })
    }),
    {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
    },
));

export const useIsSignedIn = () => useAuthStore((state) => state.isSignedIn)


export default useAuthStore;
