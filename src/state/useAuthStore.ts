import { create } from 'zustand';
import { User, onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { auth } from '../firebase/config';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  initialized: boolean;
  
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => () => void;
  refreshAdminStatus: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAdmin: false,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  
  refreshAdminStatus: async () => {
    const { user } = get();
    if (user) {
      try {
        const tokenResult = await user.getIdTokenResult(true);
        set({ isAdmin: !!tokenResult.claims.admin });
      } catch (e) {
        console.error('Failed to refresh admin claims:', e);
      }
    }
  },

  signOut: async () => {
    await fbSignOut(auth);
    set({ user: null, isAdmin: false });
  },

  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      let isAdmin = false;
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult();
          isAdmin = !!tokenResult.claims.admin;
        } catch {
          isAdmin = false;
        }
      }
      set({ user, isAdmin, loading: false, initialized: true });
    });
    return unsubscribe;
  }
}));
