import { create } from 'zustand';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  initialized: boolean;
  
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
  refreshAdminStatus: () => Promise<void>;
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
      const tokenResult = await user.getIdTokenResult(true);
      set({ isAdmin: !!tokenResult.claims.admin });
    }
  },

  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      let isAdmin = false;
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        isAdmin = !!tokenResult.claims.admin;
      }
      set({ user, isAdmin, loading: false, initialized: true });
    });
    return unsubscribe;
  }
}));
