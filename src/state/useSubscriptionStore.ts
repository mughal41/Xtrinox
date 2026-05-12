import { create } from 'zustand';
import { firestoreService } from '../services/firestore.service';
import { migrationService } from '../services/migration.service';
import { Subscription, Entitlement } from '../firebase/schema';

interface SubscriptionState {
  subscriptions: Subscription[];
  entitlements: Entitlement[];
  userDoc: any | null;
  loading: boolean;
  error: string | null;

  fetchSubscriptions: (userId: string) => Promise<void>;
  isSubscribed: (toolId: string) => boolean;
  clear: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: [],
  entitlements: [],
  userDoc: null,
  loading: false,
  error: null,

  fetchSubscriptions: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const [subs, ents, userDoc] = await Promise.all([
        firestoreService.getUserSubscriptions(userId),
        firestoreService.getEntitlements(userId),
        firestoreService.getUserDoc(userId)
      ]);

      // AUTO-MIGRATION LOGIC
      const hasModernEntitlement = ents.some(e => e.toolId === 'chatgpt-premium');
      const hasLegacyData = !!(userDoc?.encryptedPayload) || subs.some(s => s.toolId === 'chatgpt-premium');

      if (hasLegacyData && !hasModernEntitlement) {
        // Trigger synchronous migration
        await migrationService.migrateLegacyUser(userId, 'chatgpt-premium');
        // Re-fetch once migrated so the UI updates
        const newEnts = await firestoreService.getEntitlements(userId);
        set({ entitlements: newEnts, subscriptions: subs, userDoc, loading: false });
      } else {
        set({ subscriptions: subs, entitlements: ents, userDoc, loading: false });
      }
    } catch (err: any) {
      console.error('[SubscriptionStore] Fetch failed:', err);
      set({ loading: false, error: err.message });
    }
  },

  isSubscribed: (toolId: string) => {
    const { subscriptions, entitlements, userDoc } = get();
    
    // Check subscriptions collection (purchases)
    const hasActiveSub = subscriptions.some(sub => sub.toolId === toolId && sub.status === 'active');
    
    // Check entitlements collection (permissions)
    const hasActiveEnt = entitlements.some(ent => ent.toolId === toolId && ent.launchAllowed);
    
    // Legacy Check: if tool is ChatGPT and user has an encrypted payload
    const isChatGPT = toolId.toLowerCase().includes('chatgpt');
    const hasLegacyPayload = isChatGPT && userDoc?.encryptedPayload;
    
    return hasActiveSub || hasActiveEnt || !!hasLegacyPayload;
  },

  clear: () => set({ subscriptions: [], entitlements: [], userDoc: null, loading: false, error: null })
}));
