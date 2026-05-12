import { create } from 'zustand';
import { firestoreService } from '../services/firestore.service';
import { MarketplaceTool } from '../firebase/schema';

interface MarketplaceState {
  tools: MarketplaceTool[];
  loading: boolean;
  error: string | null;

  fetchTools: () => Promise<void>;
}

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  tools: [],
  loading: false,
  error: null,

  fetchTools: async () => {
    set({ loading: true, error: null });
    try {
      const tools = await firestoreService.getMarketplaceTools();
      set({ tools, loading: false });
    } catch (err: any) {
      console.error('[Marketplace] Fetch failed:', err);
      set({ loading: false, error: err.message });
    }
  },
}));
