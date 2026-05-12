import { create } from 'zustand';
import { firestoreService } from '../services/firestore.service';
import { MarketplaceTool } from '../firebase/schema';
import { SEO_PRODUCTS_AS_MARKETPLACE_TOOLS, mergeSeoProductWithFirestoreTool } from '../data/seoProducts.mjs';

interface MarketplaceState {
  tools: MarketplaceTool[];
  loading: boolean;
  error: string | null;

  fetchTools: () => Promise<void>;
}

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  tools: SEO_PRODUCTS_AS_MARKETPLACE_TOOLS as MarketplaceTool[],
  loading: false,
  error: null,

  fetchTools: async () => {
    set({ loading: true, error: null });
    try {
      const tools = await firestoreService.getMarketplaceTools();
      const mergedTools = tools.map((tool) => mergeSeoProductWithFirestoreTool(tool));
      set({
        tools: mergedTools.length > 0 ? mergedTools as MarketplaceTool[] : SEO_PRODUCTS_AS_MARKETPLACE_TOOLS as MarketplaceTool[],
        loading: false,
      });
    } catch (err: any) {
      set({
        tools: SEO_PRODUCTS_AS_MARKETPLACE_TOOLS as MarketplaceTool[],
        loading: false,
        error: err.message,
      });
    }
  },
}));
