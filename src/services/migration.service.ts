import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const migrationService = {
  /**
   * Automatically migrates a legacy user to the new subscription/entitlement flow.
   * This creates the necessary entitlements and workspace_apps documents.
   */
  async migrateLegacyUser(userId: string, toolId: string = 'chatgpt-premium') {
    try {
      // 1. Check if they already have the new entitlement to avoid redundant writes
      const entRef = doc(db, 'entitlements', `${userId}_${toolId}`);
      const entSnap = await getDoc(entRef);
      
      if (entSnap.exists()) {
        return;
      }

      // 2. Create Entitlement Document
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30); // Give 30 days for migrated users

      await setDoc(entRef, {
        userId,
        toolId,
        launchAllowed: true,
        payloadEnabled: true,
        runtimeEnabled: true,
        expiresAt: expiry,
        legacyCompatible: true,
        createdAt: serverTimestamp(),
        migrated: true // Flag to track migration
      });

      // 3. Create Workspace App Document
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

    } catch (err) {
      // Migration is best-effort and must not expose user identifiers in logs.
    }
  }
};
