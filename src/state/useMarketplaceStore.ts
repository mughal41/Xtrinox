import { create } from 'zustand';
import { firestoreService } from '../services/firestore.service';
import { MarketplaceTool } from '../firebase/schema';
import { SEO_PRODUCTS_AS_MARKETPLACE_TOOLS, mergeSeoProductWithFirestoreTool } from '../data/seoProducts.mjs';

interface MarketplaceState {
  tools: MarketplaceTool[];
  loading: boolean;
  error: string | null;

  fetchTools: () => Promise<void>;
  getToolById: (id: string) => MarketplaceTool | undefined;
}

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  tools: SEO_PRODUCTS_AS_MARKETPLACE_TOOLS as MarketplaceTool[],
  loading: false,
  error: null,

  fetchTools: async () => {
    set({ loading: true, error: null });
    try {
      const tools = await firestoreService.getMarketplaceTools();
      if (tools && tools.length > 0) {
        const mergedTools = tools.map((tool) => mergeSeoProductWithFirestoreTool(tool));
        set({
          tools: mergedTools as MarketplaceTool[],
          loading: false,
        });
      } else {
        set({
          tools: SEO_PRODUCTS_AS_MARKETPLACE_TOOLS as MarketplaceTool[],
          loading: false,
        });
      }
    } catch (err: any) {
      set({
        tools: SEO_PRODUCTS_AS_MARKETPLACE_TOOLS as MarketplaceTool[],
        loading: false,
        error: err.message || 'Failed to fetch marketplace tools from Firestore',
      });
    }
  },

  getToolById: (id: string) => {
    const { tools } = get();
    const normalized = id.toLowerCase();
    return tools.find(t => t.id === id || t.slug === id || t.id.toLowerCase().includes(normalized) || normalized.includes(t.id.toLowerCase()));
  }
}));
