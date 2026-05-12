import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  Timestamp,
  writeBatch,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  MarketplaceTool, 
  Subscription, 
  Entitlement, 
  WorkspaceApp, 
  Device,
  RuntimeStateRecord,
  Notification
} from './schema';

class FirestoreService {
  /**
   * MARKETPLACE TOOLS
   */
  async getMarketplaceTools(): Promise<MarketplaceTool[]> {
    const snap = await getDocs(query(collection(db, 'marketplace_tools'), where('active', '==', true)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as MarketplaceTool));
  }

  /**
   * SUBSCRIPTIONS & ENTITLEMENTS (The Logic Bridge)
   */
  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    // 1. Check for documents with userId field (New Flow)
    const snap = await getDocs(query(collection(db, 'subscriptions'), where('userId', '==', userId)));
    const subs = snap.docs.map(d => d.data() as Subscription);

    // 2. Check for document with userId as ID (Legacy Flow)
    const legacyDoc = await getDoc(doc(db, 'subscriptions', userId));
    if (legacyDoc.exists()) {
      const data = legacyDoc.data();
      // Convert legacy map to Subscription objects if needed
      // If legacy doc has 'chatgpt: true', we map it
      if (data.chatgpt) {
        subs.push({
          toolId: 'chatgpt-premium',
          status: 'active',
          userId: userId
        } as any);
      }
      if (data.synthetix) {
        subs.push({
          toolId: 'synthetix-pro',
          status: 'active',
          userId: userId
        } as any);
      }
    }
    
    return subs;
  }

  async getEntitlements(userId: string): Promise<Entitlement[]> {
    const snap = await getDocs(query(collection(db, 'entitlements'), where('userId', '==', userId)));
    return snap.docs.map(d => d.data() as Entitlement);
  }

  async getUserDoc(userId: string): Promise<any> {
    const snap = await getDoc(doc(db, 'users', userId));
    return snap.exists() ? snap.data() : null;
  }

  /**
   * WORKSPACE MANAGEMENT
   */
  async getWorkspaceApps(userId: string): Promise<WorkspaceApp[]> {
    const snap = await getDocs(query(
      collection(db, 'workspace_apps'), 
      where('userId', '==', userId),
      where('workspaceVisible', '==', true)
    ));
    return snap.docs.map(d => d.data() as WorkspaceApp);
  }

  /**
   * RUNTIME & DEVICE STATE
   */
  async updateRuntimeState(userId: string, data: Partial<RuntimeStateRecord>) {
    const ref = doc(db, 'runtime_states', userId);
    await setDoc(ref, { 
      ...data, 
      userId, 
      updatedAt: serverTimestamp() 
    }, { merge: true });
  }

  async getDevices(userId: string): Promise<Device[]> {
    const q = query(collection(db, 'devices'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Device);
  }

  async registerOrUpdateDevice(userId: string, deviceInfo: Omit<Device, 'userId' | 'trusted' | 'blocked' | 'blockedBy' | 'blockedAt' | 'createdAt' | 'lastActiveAt'>) {
    const ref = doc(db, 'devices', `${userId}_${deviceInfo.deviceId}`);
    
    // Use merge:true to update existing or create new without overwriting block status
    await setDoc(ref, {
      ...deviceInfo,
      userId,
      lastActiveAt: serverTimestamp(),
    }, { merge: true });

    // For truly new devices, initialize trusted/blocked fields
    // (This is a simplified approach; in production you might read first or use a transaction)
    const snap = await getDoc(ref);
    if (!snap.data()?.createdAt) {
      await updateDoc(ref, {
        trusted: true,
        blocked: false,
        blockedBy: null,
        blockedAt: null,
        createdAt: serverTimestamp()
      });
    }
  }

  async blockDevice(userId: string, deviceId: string, blockedBy: 'user' | 'admin' = 'user') {
    const ref = doc(db, 'devices', `${userId}_${deviceId}`);
    await updateDoc(ref, {
      blocked: true,
      blockedBy,
      blockedAt: serverTimestamp()
    });
  }

  async unblockDevice(userId: string, deviceId: string) {
    const ref = doc(db, 'devices', `${userId}_${deviceId}`);
    await updateDoc(ref, {
      blocked: false,
      blockedBy: null,
      blockedAt: null,
      unblockRequested: false,
      unblockRequestedAt: null
    });

    // Reset user-level flag if no other devices have requests
    const q = query(collection(db, 'devices'), where('userId', '==', userId), where('unblockRequested', '==', true));
    const snap = await getDocs(q);
    if (snap.empty) {
      await updateDoc(doc(db, 'users', userId), {
        hasPendingUnblockRequest: false
      });
    }
  }

  async requestUnblock(userId: string, deviceId: string) {
    const ref = doc(db, 'devices', `${userId}_${deviceId}`);
    await updateDoc(ref, {
      unblockRequested: true,
      unblockRequestedAt: serverTimestamp()
    });

    // Set user-level flag for global admin visibility
    await updateDoc(doc(db, 'users', userId), {
      hasPendingUnblockRequest: true
    });
  }

  async isDeviceBlocked(deviceId: string): Promise<boolean> {
    const q = query(collection(db, 'devices'), where('deviceId', '==', deviceId), where('blocked', '==', true));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  /**
   * ANALYTICS / LOGS
   */
  async logLaunch(userId: string, toolId: string, status: 'success' | 'failed', version: string, deviceId: string) {
    const ref = collection(db, 'launch_logs');
    await addDoc(ref, {
      userId,
      toolId,
      launchStatus: status,
      runtimeVersion: version,
      deviceId,
      launchedAt: serverTimestamp()
    });
  }

  /**
   * NOTIFICATIONS
   */
  async getNotifications(userId: string): Promise<Notification[]> {
    const snap = await getDocs(query(
      collection(db, 'notifications'), 
      where('userId', '==', userId),
      where('read', '==', false)
    ));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
  }
}

export const firestoreService = new FirestoreService();
