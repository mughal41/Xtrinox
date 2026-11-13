import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  orderBy, 
  serverTimestamp, 
  getDoc,
  deleteDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase/config';

// --- CLOUD FUNCTIONS CALLABLES ---
const setUserStatusFn = httpsCallable(functions, 'setUserStatus');
const bulkGrantFn = httpsCallable(functions, 'bulkGrantEntitlements');
const forceResetFn = httpsCallable(functions, 'forceResetRuntime');
const createUserFn = httpsCallable(functions, 'createUser');
const resetUserPasswordFn = httpsCallable(functions, 'resetUserPassword');
const listAdminUsersFn = httpsCallable(functions, 'listAdminUsers');

const SESSION_COOKIE_NAME_PATTERNS = [
  /^__Secure-/i,
  /^__Host-/i,
  /^cf_clearance$/i,
  /^oai-did$/i,
  /^oai-sc$/i,
  /session/i,
  /auth/i,
  /token/i,
  /csrf/i,
  /jwt/i,
  /sid/i,
  /sso/i,
  /login/i,
  /credential/i,
  /routingHint/i,
  /anthropic/i,
  /lastActiveOrg/i,
  /intercom/i,
  /^_puid$/i,
  /^oai-/i,
];

const normalizeSameSite = (sameSite: any) => {
  const value = String(sameSite || '').toLowerCase();
  if (value === 'strict') return 'strict';
  if (value === 'lax') return 'lax';
  if (value === 'none' || value === 'no_restriction' || value === 'no-restriction') return 'no_restriction';
  return undefined;
};

const normalizeExpirationDate = (cookie: any) => {
  const raw = cookie.expirationDate ?? cookie.expiry ?? cookie.expires;
  if (raw === undefined || raw === null || raw === '') return undefined;

  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) throw new Error(`Cookie "${cookie.name}" has an invalid expiration date.`);

  const seconds = numeric > 100000000000 ? Math.floor(numeric / 1000) : numeric;
  if (seconds <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return cookie.session === true ? undefined : seconds;
};

const isSessionCookie = (name: string) => {
  return SESSION_COOKIE_NAME_PATTERNS.some((pattern) => pattern.test(name));
};

export function normalizeCookiesForSession(cookiesJson: any) {
  if (!Array.isArray(cookiesJson)) {
    throw new Error('Cookies must be a JSON array.');
  }

  return cookiesJson
    .filter((cookie: any) => isSessionCookie(String(cookie?.name || '').trim()))
    .map((cookie) => {
      const name = String(cookie?.name || '').trim();
      const value = cookie?.value === undefined || cookie?.value === null ? '' : String(cookie.value);
      if (!name) return null;

      const normalized: any = {
        name,
        value,
        path: cookie.path || '/',
      };

      if (cookie.domain) normalized.domain = String(cookie.domain).trim();
      if (cookie.url) normalized.url = String(cookie.url).trim();
      if (cookie.secure !== undefined) normalized.secure = Boolean(cookie.secure);
      if (cookie.httpOnly !== undefined) normalized.httpOnly = Boolean(cookie.httpOnly);
      if (cookie.hostOnly !== undefined) normalized.hostOnly = Boolean(cookie.hostOnly);

      const sameSite = normalizeSameSite(cookie.sameSite);
      if (sameSite) {
        normalized.sameSite = sameSite;
        if (sameSite === 'no_restriction') normalized.secure = true;
      }

      const expirationDate = normalizeExpirationDate(cookie);
      if (expirationDate === null) return null;
      if (expirationDate !== undefined) normalized.expirationDate = expirationDate;

      return normalized;
    })
    .filter((cookie: any) => cookie !== null && isSessionCookie(cookie.name));
}

// --- ENCRYPTION ENGINE (WEB CRYPTO API) ---
export async function encryptSession(cookiesJson: any) {
  const plaintext = JSON.stringify(normalizeCookiesForSession(cookiesJson));
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // Generate a random 256-bit key
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt']
  );

  const exportedKey = await window.crypto.subtle.exportKey('raw', key);
  const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));

  // Generate 12-byte nonce (IV)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ivBase64 = btoa(String.fromCharCode(...iv));

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

// --- SANITIZE AUDIT DETAILS ---
function sanitizeAuditDetails(details: any): any {
  if (!details || typeof details !== 'object') return details;
  const clone = { ...details };
  delete clone.cookies;
  delete clone.password;
  delete clone.newPassword;
  delete clone.decryptionKey;
  delete clone.encryptedPayload;
  delete clone.token;
  return clone;
}

// --- AUDIT SYSTEM ---
export async function logAuditAction(adminUid: string, action: string, targetId: string, details: any) {
  const auditRef = doc(collection(db, 'admin_audit_logs'));
  await setDoc(auditRef, {
    adminUid,
    action,
    targetId,
    details: sanitizeAuditDetails(details),
    timestamp: serverTimestamp()
  });
}

// --- MARKETPLACE TOOLS ---
export const adminToolsService = {
  async getAllTools(): Promise<any[]> {
    const q = query(collection(db, 'marketplace_tools'), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
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
  },

  async deleteTool(toolId: string, adminUid: string) {
    await deleteDoc(doc(db, 'marketplace_tools', toolId));
    await logAuditAction(adminUid, 'DELETE_TOOL', toolId, {});
  }
};

// --- PRODUCT COOKIES ---
export const adminProductCookieService = {
  async getAllProductCookies() {
    const snapshot = await getDocs(query(collection(db, 'product_cookies'), orderBy('title', 'asc')));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getCookiesForTool(toolId: string) {
    const snapshot = await getDocs(query(
      collection(db, 'product_cookies'),
      where('marketplaceToolId', '==', toolId),
      where('active', '==', true)
    ));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getCookieAssignmentCounts(cookieIds: string[]) {
    const counts: Record<string, number> = {};
    await Promise.all(cookieIds.map(async (cookieId) => {
      const snapshot = await getDocs(query(collection(db, 'users'), where('activeProductCookieId', '==', cookieId)));
      counts[cookieId] = snapshot.size;
    }));
    return counts;
  },

  async createProductCookie(data: any, adminUid: string) {
    const ref = doc(collection(db, 'product_cookies'));
    const normalizedCookies = normalizeCookiesForSession(data.cookies);
    if (!normalizedCookies || normalizedCookies.length === 0) {
      throw new Error('No valid session cookies found in JSON payload.');
    }

    await setDoc(ref, {
      marketplaceToolId: data.marketplaceToolId,
      title: data.title,
      cookies: normalizedCookies,
      active: data.active ?? true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await logAuditAction(adminUid, 'CREATE_PRODUCT_COOKIE', ref.id, {
      marketplaceToolId: data.marketplaceToolId,
      title: data.title,
      cookiesCount: normalizedCookies.length
    });
  },

  async updateProductCookie(cookieId: string, data: any, adminUid: string) {
    const normalizedCookies = normalizeCookiesForSession(data.cookies);
    if (!normalizedCookies || normalizedCookies.length === 0) {
      throw new Error('No valid session cookies found in JSON payload.');
    }
    
    await updateDoc(doc(db, 'product_cookies', cookieId), {
      marketplaceToolId: data.marketplaceToolId,
      title: data.title,
      cookies: normalizedCookies,
      active: data.active ?? true,
      updatedAt: serverTimestamp(),
    });

    // Auto-sync updated cookies to users who have this as their active product cookie
    try {
      const encryptedSession = await encryptSession(normalizedCookies);
      const usersSnap = await getDocs(query(collection(db, 'users'), where('activeProductCookieId', '==', cookieId)));
      const batch = writeBatch(db);

      usersSnap.forEach(userDoc => {
        batch.update(userDoc.ref, {
          encryptedPayload: encryptedSession.payload,
          decryptionKey: encryptedSession.decryptionKey,
          updatedAt: serverTimestamp()
        });

        const entRef = doc(db, 'entitlements', `${userDoc.id}_${data.marketplaceToolId}`);
        batch.update(entRef, {
          encryptedPayload: encryptedSession.payload,
          decryptionKey: encryptedSession.decryptionKey,
        });
      });

      if (usersSnap.size > 0) {
        await batch.commit();
      }
    } catch (e) {
      console.warn("Auto-sync warning:", e);
    }

    await logAuditAction(adminUid, 'UPDATE_PRODUCT_COOKIE', cookieId, {
      marketplaceToolId: data.marketplaceToolId,
      title: data.title,
      cookiesCount: normalizedCookies.length
    });
  },

  async deleteProductCookie(cookieId: string, adminUid: string) {
    await deleteDoc(doc(db, 'product_cookies', cookieId));
    await logAuditAction(adminUid, 'DELETE_PRODUCT_COOKIE', cookieId, {});
  },
};

// --- USERS & AUTH ---
let cloudFunctionsAvailable = true;

export const adminUserService = {
  async getAllUsers() {
    if (cloudFunctionsAvailable) {
      try {
        const result = await listAdminUsersFn();
        return result.data as any[];
      } catch {
        cloudFunctionsAvailable = false;
      }
    }

    // Fallback for Spark Plan (Firestore-only)
    const q = collection(db, 'users');
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, uid: d.id, ...d.data() }));
  },

  async setUserStatus(uid: string, disabled: boolean) {
    if (!cloudFunctionsAvailable) {
      throw new Error('Action failed: This feature requires Cloud Functions (Blaze Plan).');
    }
    try {
      return await setUserStatusFn({ uid, disabled });
    } catch {
      throw new Error('Action failed: This feature requires Cloud Functions (Blaze Plan).');
    }
  },

  async createUser(email: string, password: string) {
    if (!cloudFunctionsAvailable) {
       throw new Error('User creation failed: This feature requires Cloud Functions (Blaze Plan).');
    }
    try {
      return await createUserFn({ email, password });
    } catch {
      throw new Error('User creation failed: This feature requires Cloud Functions (Blaze Plan).');
    }
  },

  async resetPassword(uid: string, newPassword: string) {
    if (!cloudFunctionsAvailable) {
      throw new Error('Password reset failed: This feature requires Cloud Functions (Blaze Plan).');
    }
    try {
      return await resetUserPasswordFn({ uid, newPassword });
    } catch {
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

  async grantAccess(userId: string, toolId: string, days: number, adminUid: string, productCookie?: any) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    const encryptedSession = productCookie ? await encryptSession(productCookie.cookies) : null;

    const entData: any = {
      userId,
      toolId,
      launchAllowed: true,
      payloadEnabled: true,
      runtimeEnabled: true,
      expiresAt: expiry,
      legacyCompatible: true,
      createdAt: serverTimestamp()
    };

    if (encryptedSession) {
      entData.encryptedPayload = encryptedSession.payload;
      entData.decryptionKey = encryptedSession.decryptionKey;
      entData.productCookieId = productCookie?.id || null;
      entData.productCookieTitle = productCookie?.title || null;
    }

    const entRef = doc(db, 'entitlements', `${userId}_${toolId}`);
    await setDoc(entRef, entData);

    if (encryptedSession) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        encryptedPayload: encryptedSession.payload,
        decryptionKey: encryptedSession.decryptionKey,
        activeToolId: toolId,
        activeProductCookieId: productCookie?.id || null,
        activeProductCookieTitle: productCookie?.title || null,
        updatedAt: serverTimestamp(),
      });
    }

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

    await logAuditAction(adminUid, 'GRANT_ACCESS', `${userId}_${toolId}`, {
      toolId,
      days,
      productCookieId: productCookie?.id || null,
      productCookieTitle: productCookie?.title || null,
    });
  },

  async grantAccessToUsers(userIds: string[], toolId: string, days: number, adminUid: string, productCookie?: any) {
    for (const userId of userIds) {
      await this.grantAccess(userId, toolId, days, adminUid, productCookie);
    }
  },

  async revokeAccess(userId: string, toolId: string, adminUid: string) {
    await deleteDoc(doc(db, 'entitlements', `${userId}_${toolId}`));
    await deleteDoc(doc(db, 'workspace_apps', `${userId}_${toolId}`));

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists() && userSnap.data()?.activeToolId === toolId) {
      await updateDoc(userRef, {
        encryptedPayload: null,
        decryptionKey: null,
        activeToolId: null,
        activeProductCookieId: null,
        activeProductCookieTitle: null,
        updatedAt: serverTimestamp(),
      });
    }

    await logAuditAction(adminUid, 'REVOKE_ACCESS', `${userId}_${toolId}`, { toolId });
  },

  async bulkGrant(uids: string[], toolId: string, days: number) {
    return await bulkGrantFn({ uids, toolId, days });
  }
};
