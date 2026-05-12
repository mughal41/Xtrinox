import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp, 
  getDoc,
  deleteDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db, app } from '../firebase/config';

const functions = getFunctions(app);

// --- CLOUD FUNCTIONS CALLABLES ---
const setUserStatusFn = httpsCallable(functions, 'setUserStatus');
const bulkGrantFn = httpsCallable(functions, 'bulkGrantEntitlements');
const forceResetFn = httpsCallable(functions, 'forceResetRuntime');
const createUserFn = httpsCallable(functions, 'createUser');
const resetUserPasswordFn = httpsCallable(functions, 'resetUserPassword');
const listAdminUsersFn = httpsCallable(functions, 'listAdminUsers');

// --- ENCRYPTION ENGINE (WEB CRYPTO API) ---
// This replicates the Python AES-GCM logic for extension bridge compatibility
export async function encryptSession(cookiesJson: any) {
  const plaintext = JSON.stringify(cookiesJson);
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // Generate a random 256-bit key
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt']
  );

  // Export key to base64 for decryptionKey field
  const exportedKey = await window.crypto.subtle.exportKey('raw', key);
  const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));

  // Generate 12-byte nonce (IV)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ivBase64 = btoa(String.fromCharCode(...iv));

  // Encrypt
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  const ciphertextBase64 = btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer)));

  return {
    payload: {
      iv: ivBase64,
      ciphertext: ciphertextBase64
    },
    decryptionKey: keyBase64
  };
}

// --- AUDIT SYSTEM ---
export async function logAuditAction(adminUid: string, action: string, targetId: string, details: any) {
  const auditRef = doc(collection(db, 'admin_audit_logs'));
  await setDoc(auditRef, {
    adminUid,
    action,
    targetId,
    details,
    timestamp: serverTimestamp()
  });
}

// --- MARKETPLACE TOOLS ---
export const adminToolsService = {
  async getAllTools() {
    const q = query(collection(db, 'marketplace_tools'), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async updateTool(toolId: string, data: any, adminUid: string) {
    const toolRef = doc(db, 'marketplace_tools', toolId);
    await updateDoc(toolRef, { ...data, updatedAt: serverTimestamp() });
    await logAuditAction(adminUid, 'UPDATE_TOOL', toolId, data);
  },

  async createTool(toolId: string, data: any, adminUid: string) {
    const toolRef = doc(db, 'marketplace_tools', toolId);
    await setDoc(toolRef, { 
      ...data, 
      id: toolId,
      slug: toolId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp() 
    });
    await logAuditAction(adminUid, 'CREATE_TOOL', toolId, data);
  }
};

// --- USERS & AUTH ---
let cloudFunctionsAvailable = true;

export const adminUserService = {
  async getAllUsers() {
    if (cloudFunctionsAvailable) {
      try {
        const result = await listAdminUsersFn();
        return result.data as any[];
      } catch (error: any) {
        console.warn('[AdminService] Cloud Function unavailable. Switching to Firestore-only mode.', error.message);
        cloudFunctionsAvailable = false;
        // Fallback below
      }
    }

    // Fallback for Spark Plan (Firestore-only)
    const q = collection(db, 'users');
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async setUserStatus(uid: string, disabled: boolean) {
    if (!cloudFunctionsAvailable) {
      throw new Error('Action failed: This feature requires Cloud Functions (Blaze Plan).');
    }
    try {
      return await setUserStatusFn({ uid, disabled });
    } catch (e: any) {
      throw new Error('Action failed: This feature requires Cloud Functions (Blaze Plan).');
    }
  },

  async createUser(email: string, password: string) {
    if (!cloudFunctionsAvailable) {
       throw new Error('User creation failed: This feature requires Cloud Functions (Blaze Plan).');
    }
    try {
      return await createUserFn({ email, password });
    } catch (e: any) {
      throw new Error('User creation failed: This feature requires Cloud Functions (Blaze Plan).');
    }
  },

  async resetPassword(uid: string, newPassword: string) {
    if (!cloudFunctionsAvailable) {
      throw new Error('Password reset failed: This feature requires Cloud Functions (Blaze Plan).');
    }
    try {
      return await resetUserPasswordFn({ uid, newPassword });
    } catch (e: any) {
      throw new Error('Password reset failed: This feature requires Cloud Functions (Blaze Plan).');
    }
  },

  async forceReset(uid: string) {
    return await forceResetFn({ uid });
  }
};

// --- ENTITLEMENTS & SESSIONS ---
export const adminEntitlementService = {
  async bulkInjectSession(uids: string[], cookiesJson: any, adminUid: string) {
    const { payload, decryptionKey } = await encryptSession(cookiesJson);
    const batch = writeBatch(db);
    
    for (const uid of uids) {
      const userRef = doc(db, 'users', uid);
      batch.update(userRef, {
        encryptedPayload: payload,
        decryptionKey: decryptionKey,
        updatedAt: serverTimestamp()
      });
    }
    
    await batch.commit();
    await logAuditAction(adminUid, 'BULK_SESSION_INJECTION', 'multiple', { count: uids.length });
  },

  async grantAccess(userId: string, toolId: string, days: number, adminUid: string) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);

    const entRef = doc(db, 'entitlements', `${userId}_${toolId}`);
    await setDoc(entRef, {
      userId,
      toolId,
      launchAllowed: true,
      payloadEnabled: true,
      runtimeEnabled: true,
      expiresAt: expiry,
      legacyCompatible: true,
      createdAt: serverTimestamp()
    });

    const wsRef = doc(db, 'workspace_apps', `${userId}_${toolId}`);
    await setDoc(wsRef, {
      userId,
      toolId,
      pinned: true,
      workspaceVisible: true,
      lastOpenedAt: null,
      launchCount: 0,
      createdAt: serverTimestamp()
    });

    await logAuditAction(adminUid, 'GRANT_ACCESS', `${userId}_${toolId}`, { toolId, days });
  },

  async bulkGrant(uids: string[], toolId: string, days: number) {
    return await bulkGrantFn({ uids, toolId, days });
  }
};
