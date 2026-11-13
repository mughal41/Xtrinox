import {
  AdminTool,
  ProductCookieSet,
  CookieItem,
  AdminUser,
  AuditLogRecord,
  SystemSettingsState,
  ToastItem
} from '../types/admin';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp, 
  onSnapshot, 
  getDoc 
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { 
  adminToolsService, 
  adminProductCookieService, 
  adminUserService, 
  adminEntitlementService, 
  normalizeCookiesForSession,
  logAuditAction
} from './admin.service';
import { firestoreService } from './firestore.service';

type Listener = () => void;

class AdminStore {
  private listeners: Set<Listener> = new Set();

  public isAdmin: boolean = false;
  public isVerifying: boolean = false;
  public isInitialized: boolean = false;

  public counts = {
    users: 0,
    marketplaceTools: 0,
    entitlements: 0
  };

  public tools: AdminTool[] = [];
  public cookieSets: ProductCookieSet[] = [];
  public users: AdminUser[] = [];
  public auditLogs: AuditLogRecord[] = [];
  public toasts: ToastItem[] = [];

  public systemSettings: SystemSettingsState = {
    maintenanceMode: false,
    userRegistration: true,
    marketplaceVisibility: true,
    requiredBridgeVersion: '1.0.0',
    lastUpdated: new Date().toISOString()
  };

  public runtimeMetrics = {
    activeConnections: 0,
    staleConnections: 0,
    conflicts: 0,
    versionBreakdown: {} as Record<string, number>,
    lastHeartbeat: 'None recorded'
  };

  private unsubscribeRuntime?: () => void;

  constructor() {
    this.initAuthListener();
  }

  private initAuthListener() {
    auth.onAuthStateChanged(async (user) => {
      this.isVerifying = true;
      this.notify();
      if (!user) {
        this.isAdmin = false;
        this.isVerifying = false;
        this.isInitialized = true;
        this.notify();
        return;
      }
      try {
        const tokenResult = await user.getIdTokenResult(true);
        this.isAdmin = tokenResult.claims.admin === true;
        if (this.isAdmin) {
          this.refreshDashboard().catch(() => {});
          this.loadTools().catch(() => {});
          this.loadCookieSets().catch(() => {});
          this.loadSystemSettings().catch(() => {});
          this.subscribeToRuntime();
        }
      } catch {
        this.isAdmin = false;
      } finally {
        this.isVerifying = false;
        this.isInitialized = true;
        this.notify();
      }
    });
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notify() {
    this.listeners.forEach((l) => l());
  }

  public async verifyAdminCredentials(): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) {
      this.isAdmin = false;
      this.isInitialized = true;
      this.notify();
      return false;
    }
    this.isVerifying = true;
    this.notify();
    try {
      const tokenResult = await user.getIdTokenResult(true);
      this.isAdmin = tokenResult.claims.admin === true;
    } catch {
      this.isAdmin = false;
    } finally {
      this.isVerifying = false;
      this.isInitialized = true;
      this.notify();
    }
    return this.isAdmin;
  }

  public setAdminStatus(status: boolean) {
    this.isAdmin = status;
    this.notify();
  }

  public getCounts() {
    return this.counts;
  }

  // --- GLOBAL FETCH ALL ---
  public async fetchAll() {
    this.isVerifying = true;
    this.notify();
    try {
      await Promise.allSettled([
        this.refreshDashboard(),
        this.loadTools(),
        this.loadCookieSets(),
        this.loadUsers(),
        this.loadAuditLogs(),
        this.loadSystemSettings()
      ]);
    } finally {
      this.isVerifying = false;
      this.isInitialized = true;
      this.notify();
    }
  }

  // --- DASHBOARD REFRESH ---
  public async refreshDashboard() {
    this.isVerifying = true;
    this.notify();
    try {
      const [usersSnap, toolsSnap, entitlementsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'marketplace_tools')),
        getDocs(collection(db, 'entitlements')),
      ]);
      this.counts = {
        users: usersSnap.size,
        marketplaceTools: toolsSnap.size,
        entitlements: entitlementsSnap.size
      };
    } finally {
      this.isVerifying = false;
      this.notify();
    }
  }

  // --- TOOLS INVENTORY ---
  public async loadTools() {
    try {
      const raw = await adminToolsService.getAllTools();
      if (raw && raw.length > 0) {
        this.tools = raw.map((t: any) => ({
          id: t.id || t.slug,
          name: t.name || '',
          category: t.category || 'assistant',
          categoryLabel: t.category || 'AI Assistant',
          monthlyPrice: Number(String(t.monthlyPrice || '').replace(/[^0-9.]/g, '')) || 5000,
          monthlyPriceFormatted: t.monthlyPrice || 'Rs 5,000',
          basePriceUsd: t.basePriceUsd || '$20.00 USD',
          imageUrl: t.imageUrl || '#0B0B0C',
          launchUrl: t.launchUrl || '',
          seoContent: t.seoContent || '',
          isActive: t.active !== false,
          requiresBridge: t.requiresBridge !== false,
          featured: !!t.featured,
          createdAt: t.createdAt?.toDate ? t.createdAt.toDate().toISOString() : '',
          updatedAt: t.updatedAt?.toDate ? t.updatedAt.toDate().toISOString() : ''
        }));
        this.notify();
      }
    } catch (e) {
      console.warn('Failed to load tools from Firestore:', e);
    }
  }

  public async addTool(toolData: Omit<AdminTool, 'createdAt' | 'updatedAt'>) {
    const adminUid = auth.currentUser?.uid || 'admin';
    await adminToolsService.createTool(toolData.id, {
      name: toolData.name,
      category: toolData.category,
      monthlyPrice: toolData.monthlyPriceFormatted || `Rs ${toolData.monthlyPrice}`,
      imageUrl: toolData.imageUrl || '',
      launchUrl: toolData.launchUrl || '',
      seoContent: toolData.seoContent || '',
      active: toolData.isActive ?? true,
      requiresBridge: toolData.requiresBridge ?? true,
      featured: !!toolData.featured,
    }, adminUid);
    await this.loadTools();
    this.addToast({
      type: 'success',
      title: 'Tool Created',
      message: `"${toolData.name}" has been created in marketplace_tools.`
    });
  }

  public async updateTool(id: string, updates: Partial<AdminTool>) {
    const adminUid = auth.currentUser?.uid || 'admin';
    const payload: any = { ...updates };
    if (updates.isActive !== undefined) {
      payload.active = updates.isActive;
    }
    if (updates.monthlyPriceFormatted) {
      payload.monthlyPrice = updates.monthlyPriceFormatted;
    }
    await adminToolsService.updateTool(id, payload, adminUid);
    await this.loadTools();
    this.addToast({
      type: 'success',
      title: 'Tool Updated',
      message: `Changes to ${id} have been saved.`
    });
  }

  public async deleteTool(id: string) {
    const adminUid = auth.currentUser?.uid || 'admin';
    await adminToolsService.deleteTool(id, adminUid);
    await this.loadTools();
    this.addToast({
      type: 'success',
      title: 'Tool Deleted',
      message: `Tool "${id}" has been removed from Firestore.`
    });
  }

  // --- PRODUCT COOKIES ---
  public async loadCookieSets() {
    try {
      const [cookieDocs, tools] = await Promise.all([
        adminProductCookieService.getAllProductCookies(),
        adminToolsService.getAllTools(),
      ]);
      const cookieIds = cookieDocs.map(c => c.id);
      const assignmentCounts = await adminProductCookieService.getCookieAssignmentCounts(cookieIds);

      this.cookieSets = cookieDocs.map((c: any) => {
        const tool = tools.find((t: any) => t.id === c.marketplaceToolId);
        return {
          id: c.id,
          toolId: c.marketplaceToolId,
          toolName: tool ? tool.name : c.marketplaceToolId,
          title: c.title,
          cookies: c.cookies || [],
          cookieCount: (c.cookies || []).length,
          assignedUsersCount: assignmentCounts[c.id] || 0,
          isActive: c.active !== false,
          createdAt: c.createdAt?.toDate ? c.createdAt.toDate().toISOString() : '',
          updatedAt: c.updatedAt?.toDate ? c.updatedAt.toDate().toISOString() : '',
        };
      });
      this.notify();
    } catch (e) {
      console.warn('Failed to load cookie sets from Firestore:', e);
    }
  }

  public normalizeCookies(jsonString: string): {
    validCookies: CookieItem[];
    removedCount: number;
    error?: string;
  } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        return { validCookies: [], removedCount: 0, error: 'Cookie payload must be a JSON array.' };
      }

      const normalized = normalizeCookiesForSession(parsed);
      const removedCount = parsed.length - normalized.length;

      if (normalized.length === 0) {
        return { validCookies: [], removedCount, error: 'No valid session cookies found. Non-session or expired cookies were removed.' };
      }

      return { validCookies: normalized as any, removedCount };
    } catch {
      return { validCookies: [], removedCount: 0, error: 'Invalid JSON syntax. Please verify JSON array format.' };
    }
  }

  public async addCookieSet(data: {
    toolId: string;
    title: string;
    cookies: CookieItem[];
    isActive: boolean;
  }) {
    const adminUid = auth.currentUser?.uid || 'admin';
    await adminProductCookieService.createProductCookie({
      marketplaceToolId: data.toolId,
      title: data.title,
      cookies: data.cookies,
      active: data.isActive,
    }, adminUid);
    await this.loadCookieSets();
    this.addToast({
      type: 'success',
      title: 'Cookie Set Created',
      message: `"${data.title}" has been saved.`
    });
  }

  public async updateCookieSet(
    id: string,
    data: {
      toolId: string;
      title: string;
      cookies: CookieItem[];
      isActive: boolean;
    }
  ) {
    const adminUid = auth.currentUser?.uid || 'admin';
    await adminProductCookieService.updateProductCookie(id, {
      marketplaceToolId: data.toolId,
      title: data.title,
      cookies: data.cookies,
      active: data.isActive,
    }, adminUid);
    await this.loadCookieSets();
    this.addToast({
      type: 'success',
      title: 'Cookie Set Updated',
      message: `"${data.title}" updated and auto-synced to active users.`
    });
  }

  public async deleteCookieSet(id: string) {
    const adminUid = auth.currentUser?.uid || 'admin';
    await adminProductCookieService.deleteProductCookie(id, adminUid);
    await this.loadCookieSets();
    this.addToast({
      type: 'success',
      title: 'Cookie Set Deleted',
      message: 'Product cookie set removed from Firestore.'
    });
  }

  // --- USER DIRECTORY ---
  public async loadUsers() {
    try {
      const userList = await adminUserService.getAllUsers();
      this.users = userList.map((u: any) => ({
        uid: u.uid || u.id,
        email: u.email || '',
        status: u.disabled ? 'suspended' : (u.hasPendingUnblockRequest ? 'restoration_requested' : 'operational'),
        role: u.admin ? 'Administrator' : 'Standard User',
        createdAt: u.createdAt ? (typeof u.createdAt === 'string' ? u.createdAt : u.createdAt.toDate?.()?.toISOString?.()) : '',
        lastLogin: u.lastSignInTime || '',
        subscriptions: [],
        launchHistory: [],
        devices: []
      }));
      this.notify();
    } catch (e) {
      console.warn('Failed to load users:', e);
    }
  }

  public async createNewUser(email: string, password: string) {
    const res = await adminUserService.createUser(email, password);
    await this.loadUsers();
    this.addToast({
      type: 'success',
      title: 'User Created',
      message: `User ${email} created in Firebase Authentication.`
    });
    return res;
  }

  public async linkExistingUser(email: string, uid: string) {
    const ref = doc(db, 'users', uid);
    await setDoc(ref, {
      id: uid,
      email,
      disabled: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    await logAuditAction(auth.currentUser?.uid || 'admin', 'LINK_USER', uid, { email });
    await this.loadUsers();
    this.addToast({
      type: 'success',
      title: 'User Linked',
      message: `Linked ${email} to Firebase UID ${uid}.`
    });
  }

  public async toggleUserStatus(uid: string) {
    const user = this.users.find(u => u.uid === uid);
    if (!user) return;
    const newDisabled = user.status === 'operational';
    await adminUserService.setUserStatus(uid, newDisabled);
    await this.loadUsers();
    this.addToast({
      type: 'success',
      title: newDisabled ? 'User Suspended' : 'User Activated',
      message: `Account status updated for ${user.email}.`
    });
  }

  public async resetUserPassword(uid: string, newPassword: string) {
    await adminUserService.resetPassword(uid, newPassword);
    this.addToast({
      type: 'success',
      title: 'Password Reset',
      message: 'User password was updated via Firebase Authentication.'
    });
  }

  public async forceResetRuntime(uid: string) {
    await adminUserService.forceReset(uid);
    this.addToast({
      type: 'success',
      title: 'Runtime Reset',
      message: `Forced runtime state reset for UID ${uid}.`
    });
  }

  public async unblockUserDevice(uid: string, deviceId: string) {
    await firestoreService.unblockDevice(uid, deviceId);
    this.addToast({
      type: 'success',
      title: 'Device Restored',
      message: `Device ${deviceId} unblocked for user ${uid}.`
    });
  }

  // --- ENTITLEMENTS ---
  public async grantAccess(userIds: string[], toolId: string, durationDays: number, productCookieId?: string) {
    const adminUid = auth.currentUser?.uid || 'admin';
    let cookieSet = null;
    if (productCookieId) {
      const snap = await getDoc(doc(db, 'product_cookies', productCookieId));
      if (snap.exists()) {
        cookieSet = { id: snap.id, ...snap.data() };
      }
    }
    await adminEntitlementService.grantAccessToUsers(userIds, toolId, durationDays, adminUid, cookieSet);
    this.addToast({
      type: 'success',
      title: 'Entitlement Granted',
      message: `Granted access to ${userIds.length} user(s) for ${durationDays} day(s).`
    });
  }

  public async revokeAccess(userId: string, toolId: string) {
    const adminUid = auth.currentUser?.uid || 'admin';
    await adminEntitlementService.revokeAccess(userId, toolId, adminUid);
    this.addToast({
      type: 'success',
      title: 'Entitlement Revoked',
      message: `Revoked access to ${toolId} for user ${userId}.`
    });
  }

  // --- RUNTIME MONITOR ---
  private subscribeToRuntime() {
    if (this.unsubscribeRuntime) {
      this.unsubscribeRuntime();
    }
    const q = collection(db, 'runtime_states');
    this.unsubscribeRuntime = onSnapshot(q, (snapshot) => {
      let active = 0;
      let stale = 0;
      let conflicts = 0;
      const versions: Record<string, number> = {};
      let latestTime = 0;

      const now = Date.now();
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const updatedMs = data.updatedAt?.toMillis ? data.updatedAt.toMillis() : (data.lastHeartbeat?.toMillis ? data.lastHeartbeat.toMillis() : 0);
        const isStale = (now - updatedMs) > 90000;

        if (data.conflictDetected) {
          conflicts++;
        }

        if (data.bridgeConnected && !isStale) {
          active++;
        } else {
          stale++;
        }

        const v = data.connectorVersion || 'unknown';
        versions[v] = (versions[v] || 0) + 1;

        if (updatedMs > latestTime) {
          latestTime = updatedMs;
        }
      });

      this.runtimeMetrics = {
        activeConnections: active,
        staleConnections: stale,
        conflicts,
        versionBreakdown: versions,
        lastHeartbeat: latestTime > 0 ? new Date(latestTime).toLocaleTimeString() : 'None recorded'
      };
      this.notify();
    }, (error) => {
      console.warn('Runtime monitor listener error:', error);
    });
  }

  // --- AUDIT LOGS ---
  public async loadAuditLogs() {
    try {
      const q = query(
        collection(db, 'admin_audit_logs'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const snap = await getDocs(q);
      this.auditLogs = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          action: data.action || 'UNKNOWN_ACTION',
          actionType: data.action?.includes('DELETE') ? 'delete' : data.action?.includes('CREATE') ? 'create' : 'update',
          targetId: data.targetId || '',
          targetType: data.targetType || 'resource',
          adminUid: data.adminUid || 'admin',
          adminEmail: data.adminEmail || 'admin@xtrinox.io',
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString(),
          details: data.details || {}
        };
      });
      this.notify();
    } catch (e) {
      console.warn('Failed to load audit logs:', e);
    }
  }

  // --- SYSTEM SETTINGS ---
  public async loadSystemSettings() {
    try {
      const globalDoc = await getDoc(doc(db, 'system_configs', 'global'));
      if (globalDoc.exists()) {
        const data = globalDoc.data();
        this.systemSettings = {
          maintenanceMode: !!data.maintenanceMode,
          userRegistration: data.registrationEnabled !== false,
          marketplaceVisibility: data.marketplaceVisible !== false,
          requiredBridgeVersion: data.bridgeVersionRequired || '1.0.0',
          lastUpdated: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString()
        };
        this.notify();
      }
    } catch (e) {
      console.warn('Failed to load system settings:', e);
    }
  }

  public async updateSystemSetting(key: keyof SystemSettingsState, value: any) {
    const fieldMapping: Record<string, string> = {
      maintenanceMode: 'maintenanceMode',
      userRegistration: 'registrationEnabled',
      marketplaceVisibility: 'marketplaceVisible',
      requiredBridgeVersion: 'bridgeVersionRequired'
    };

    const firestoreField = fieldMapping[key as string] || (key as string);
    await setDoc(doc(db, 'system_configs', 'global'), {
      [firestoreField]: value,
      updatedAt: serverTimestamp()
    }, { merge: true });

    this.systemSettings = {
      ...this.systemSettings,
      [key]: value,
      lastUpdated: new Date().toISOString()
    };
    this.notify();

    await logAuditAction(
      auth.currentUser?.uid || 'admin',
      'UPDATE_SYSTEM_SETTING',
      'system_configs/global',
      { [key]: value }
    );

    this.addToast({
      type: 'success',
      title: 'Setting Updated',
      message: `${String(key)} has been saved to Firestore.`
    });
  }

  // --- ALIASES & COMPATIBILITY HELPERS ---
  public get user() {
    const cur = auth.currentUser;
    return {
      name: cur?.displayName || cur?.email?.split('@')[0] || 'Admin',
      email: cur?.email || 'admin@xtrinox.com'
    };
  }

  public async signOutAdmin() {
    await auth.signOut();
  }

  public get logs() {
    return this.auditLogs;
  }

  public get settings() {
    return this.systemSettings;
  }

  public async updateSettings(updates: Partial<SystemSettingsState>) {
    for (const [key, value] of Object.entries(updates)) {
      await this.updateSystemSetting(key as keyof SystemSettingsState, value);
    }
  }

  public async addUser(userData: Partial<AdminUser> & { email: string; uid?: string; password?: string }) {
    if (userData.password) {
      return this.createNewUser(userData.email, userData.password);
    } else if (userData.uid) {
      return this.linkExistingUser(userData.email, userData.uid);
    } else {
      const uid = `usr_${Math.random().toString(36).substring(2, 9)}`;
      return this.linkExistingUser(userData.email, uid);
    }
  }

  public async setUserStatus(uid: string, status: 'operational' | 'suspended') {
    const disabled = status === 'suspended';
    await adminUserService.setUserStatus(uid, disabled);
    await this.loadUsers();
    this.addToast({
      type: 'success',
      title: disabled ? 'User Suspended' : 'User Activated',
      message: `Account status updated for UID ${uid}.`
    });
  }

  public async grantUserEntitlement(uid: string, opts: { toolId: string; cookieSetId: string; durationDays: number }) {
    return this.grantAccess([uid], opts.toolId, opts.durationDays, opts.cookieSetId);
  }

  public async revokeUserSubscription(uid: string, subIdOrToolId: string) {
    return this.revokeAccess(uid, subIdOrToolId);
  }

  public async approveAndWhitelistDevice(uid: string, deviceId: string) {
    await firestoreService.unblockDevice(uid, deviceId);
    await this.loadUsers();
    this.addToast({
      type: 'success',
      title: 'Device Whitelisted',
      message: `Approved and whitelisted device ${deviceId} for UID ${uid}.`
    });
  }

  public async unblockDevice(uid: string, deviceId: string) {
    return this.unblockUserDevice(uid, deviceId);
  }

  // --- TOASTS ---
  public addToast(toast: Omit<ToastItem, 'id'>) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastItem = { ...toast, id };
    this.toasts = [...this.toasts, newToast];
    this.notify();

    setTimeout(() => {
      this.removeToast(id);
    }, toast.duration || 4000);
  }

  public removeToast(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }
}

export const adminStore = new AdminStore();
