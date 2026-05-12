const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// --- HELPER: Verify Admin Claim ---
const verifyAdmin = (context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The function must be called by an authenticated administrator.'
    );
  }
};

// --- USER MANAGEMENT ---

/**
 * Disable or Enable a user account
 */
exports.setUserStatus = functions.https.onCall(async (data, context) => {
  verifyAdmin(context);

  const { uid, disabled } = data;
  
  try {
    await admin.auth().updateUser(uid, { disabled });
    
    // Log the action
    await admin.firestore().collection('admin_audit_logs').add({
      adminUid: context.auth.uid,
      action: disabled ? 'DISABLE_USER' : 'ENABLE_USER',
      targetId: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Bulk Grant Entitlements
 */
exports.bulkGrantEntitlements = functions.https.onCall(async (data, context) => {
  verifyAdmin(context);

  const { uids, toolId, days } = data;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);

  const batch = admin.firestore().batch();

  for (const uid of uids) {
    const entRef = admin.firestore().collection('entitlements').doc(`${uid}_${toolId}`);
    batch.set(entRef, {
      userId: uid,
      toolId,
      launchAllowed: true,
      payloadEnabled: true,
      runtimeEnabled: true,
      expiresAt: expiry,
      legacyCompatible: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const wsRef = admin.firestore().collection('workspace_apps').doc(`${uid}_${toolId}`);
    batch.set(wsRef, {
      userId: uid,
      toolId,
      pinned: true,
      workspaceVisible: true,
      lastOpenedAt: null,
      launchCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  await batch.commit();

  await admin.firestore().collection('admin_audit_logs').add({
    adminUid: context.auth.uid,
    action: 'BULK_GRANT_ENTITLEMENTS',
    targetId: toolId,
    details: { count: uids.length, days },
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true };
});

/**
 * Force Reset Runtime State for a user
 */
exports.forceResetRuntime = functions.https.onCall(async (data, context) => {
  verifyAdmin(context);

  const { uid } = data;
  
  await admin.firestore().collection('runtime_states').doc(uid).delete();
  
  await admin.firestore().collection('admin_audit_logs').add({
    adminUid: context.auth.uid,
    action: 'FORCE_RESET_RUNTIME',
    targetId: uid,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true };
});

/**
 * Create a new user account
 */
exports.createUser = functions.https.onCall(async (data, context) => {
  verifyAdmin(context);

  const { email, password } = data;
  
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: true
    });
    
    // Initialize user doc in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      id: userRecord.uid,
      disabled: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await admin.firestore().collection('admin_audit_logs').add({
      adminUid: context.auth.uid,
      action: 'CREATE_USER',
      targetId: userRecord.uid,
      details: { email },
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, uid: userRecord.uid };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Reset user password
 */
exports.resetUserPassword = functions.https.onCall(async (data, context) => {
  verifyAdmin(context);
  const { uid, newPassword } = data;
  try {
    await admin.auth().updateUser(uid, { password: newPassword });
    await admin.firestore().collection('admin_audit_logs').add({
      adminUid: context.auth.uid,
      action: 'RESET_PASSWORD',
      targetId: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * List all users with Auth and Firestore metadata merged
 */
exports.listAdminUsers = functions.https.onCall(async (data, context) => {
  verifyAdmin(context);
  
  try {
    const listUsersResult = await admin.auth().listUsers(100);
    const firestoreUsers = await admin.firestore().collection('users').get();
    
    const usersMap = {};
    firestoreUsers.forEach(doc => {
      usersMap[doc.id] = doc.data();
    });
    
    const mergedUsers = listUsersResult.users.map(user => {
      const fsData = usersMap[user.uid] || {};
      return {
        uid: user.uid,
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        disabled: user.disabled,
        createdAt: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
        ...fsData
      };
    });
    
    return mergedUsers;
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
