import { create } from 'zustand';
import { firestoreService } from '../services/firestore.service';
import { Subscription, Entitlement, UserProfileDocument } from '../firebase/schema';

interface SubscriptionState {
  subscriptions: Subscription[];
  entitlements: Entitlement[];
  userDoc: UserProfileDocument | null;
  loading: boolean;
  error: string | null;

  fetchSubscriptions: (userId: string) => Promise<void>;
  isSubscribed: (toolId: string) => boolean;
  getEntitlementForTool: (toolId: string) => Entitlement | undefined;
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

      set({ subscriptions: subs, entitlements: ents, userDoc, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message || 'Failed to fetch subscriptions' });
    }
  },

  getEntitlementForTool: (toolId: string) => {
    const { entitlements } = get();
    return entitlements.find(e => e.toolId === toolId || e.toolId.toLowerCase().includes(toolId.toLowerCase()));
  },

  isSubscribed: (toolId: string) => {
    const { subscriptions, entitlements, userDoc } = get();
    const normalizedToolId = toolId.toLowerCase();
    
    // Check subscriptions collection (purchases)
    const hasActiveSub = subscriptions.some(sub => 
      (sub.toolId === toolId || sub.toolId.toLowerCase().includes(normalizedToolId) || normalizedToolId.includes(sub.toolId.toLowerCase())) && 
      sub.status === 'active'
    );
    if (hasActiveSub) return true;
    
    // Check entitlements collection with expiration check
    const ent = entitlements.find(e => 
      e.toolId === toolId || 
      e.toolId.toLowerCase().includes(normalizedToolId) || 
      normalizedToolId.includes(e.toolId.toLowerCase())
    );

    if (ent && ent.launchAllowed) {
      let expiresAtDate: Date | null = null;
      if (ent.expiresAt?.toDate) {
        expiresAtDate = ent.expiresAt.toDate();
      } else if (ent.expiresAt) {
        expiresAtDate = new Date(ent.expiresAt);
      }
      
      if (!expiresAtDate || expiresAtDate > new Date()) {
        return true;
      }
    }
    
    // Legacy Check: if tool is ChatGPT and user has an active legacy encrypted payload
    const isChatGPT = normalizedToolId.includes('chatgpt');
    const hasLegacyPayload = isChatGPT && userDoc?.encryptedPayload;
    if (hasLegacyPayload) return true;

    // Check if activeToolId on user document matches
    if (userDoc?.activeToolId && (userDoc.activeToolId === toolId || userDoc.activeToolId.toLowerCase().includes(normalizedToolId))) {
      return true;
    }
    
    return false;
  },

  clear: () => set({ subscriptions: [], entitlements: [], userDoc: null, loading: false, error: null })
}));
