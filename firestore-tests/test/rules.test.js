import fs from 'node:fs/promises';
import process from 'node:process';
import test from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';

const projectId = 'xtrinox-rules-test';
const emulatorAddress = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8088';
const separator = emulatorAddress.lastIndexOf(':');
const host = emulatorAddress.slice(0, separator);
const port = Number(emulatorAddress.slice(separator + 1));
let rules;

test.before(async () => {
  rules = await initializeTestEnvironment({
    projectId,
    firestore: {
      host,
      port,
      rules: await fs.readFile(new URL('../../firestore.rules', import.meta.url), 'utf8')
    }
  });

  await rules.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      setDoc(doc(db, 'users/alice'), {
        email: 'alice@example.test',
        encryptedPayload: { iv: 'iv', ciphertext: 'ciphertext' },
        decryptionKey: 'secret'
      }),
      setDoc(doc(db, 'users/bob'), { email: 'bob@example.test' }),
      setDoc(doc(db, 'entitlements/alice_chatgpt'), {
        userId: 'alice',
        toolId: 'chatgpt-premium',
        launchAllowed: true
      }),
      setDoc(doc(db, 'entitlements/bob_chatgpt'), {
        userId: 'bob',
        toolId: 'chatgpt-premium',
        launchAllowed: true
      }),
      setDoc(doc(db, 'subscriptions/alice'), { chatgpt: true }),
      setDoc(doc(db, 'subscriptions/bob_modern'), {
        userId: 'bob',
        toolId: 'chatgpt-premium',
        status: 'active'
      }),
      setDoc(doc(db, 'workspace_apps/alice_chatgpt'), {
        userId: 'alice',
        toolId: 'chatgpt-premium',
        workspaceVisible: true
      }),
      setDoc(doc(db, 'devices/alice_phone'), {
        userId: 'alice',
        deviceId: 'phone',
        blocked: false
      }),
      setDoc(doc(db, 'notifications/bob_notice'), {
        userId: 'bob',
        read: false
      }),
      setDoc(doc(db, 'product_cookies/chatgpt'), {
        encryptedPayload: { iv: 'iv', ciphertext: 'ciphertext' }
      })
    ]);
  });
});

test.after(async () => {
  await rules.cleanup();
});

test.beforeEach(async () => {
  await rules.clearFirestore();
  await rules.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      setDoc(doc(db, 'users/alice'), {
        email: 'alice@example.test',
        encryptedPayload: { iv: 'iv', ciphertext: 'ciphertext' },
        decryptionKey: 'secret'
      }),
      setDoc(doc(db, 'users/bob'), { email: 'bob@example.test' }),
      setDoc(doc(db, 'entitlements/alice_chatgpt'), {
        userId: 'alice',
        toolId: 'chatgpt-premium',
        launchAllowed: true
      }),
      setDoc(doc(db, 'entitlements/bob_chatgpt'), {
        userId: 'bob',
        toolId: 'chatgpt-premium',
        launchAllowed: true
      }),
      setDoc(doc(db, 'subscriptions/alice'), { chatgpt: true }),
      setDoc(doc(db, 'subscriptions/bob_modern'), {
        userId: 'bob',
        toolId: 'chatgpt-premium',
        status: 'active'
      }),
      setDoc(doc(db, 'workspace_apps/alice_chatgpt'), {
        userId: 'alice',
        toolId: 'chatgpt-premium',
        workspaceVisible: true
      }),
      setDoc(doc(db, 'devices/alice_phone'), {
        userId: 'alice',
        deviceId: 'phone',
        blocked: false
      }),
      setDoc(doc(db, 'notifications/bob_notice'), {
        userId: 'bob',
        read: false
      }),
      setDoc(doc(db, 'product_cookies/chatgpt'), {
        encryptedPayload: { iv: 'iv', ciphertext: 'ciphertext' }
      })
    ]);
  });
});

const dbFor = (uid, claims = {}) =>
  rules.authenticatedContext(uid, claims).firestore();

test('unauthenticated clients cannot read entitlement data', async () => {
  const db = rules.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(db, 'entitlements/alice_chatgpt')));
});

test('users can read only their own entitlement documents', async () => {
  const db = dbFor('alice');
  await assertSucceeds(getDoc(doc(db, 'entitlements/alice_chatgpt')));
  await assertFails(getDoc(doc(db, 'entitlements/bob_chatgpt')));
});

test('entitlement list queries must be constrained to the caller UID', async () => {
  const db = dbFor('alice');
  await assertSucceeds(
    getDocs(query(collection(db, 'entitlements'), where('userId', '==', 'alice')))
  );
  await assertFails(getDocs(collection(db, 'entitlements')));
  await assertFails(
    getDocs(query(collection(db, 'entitlements'), where('userId', '==', 'bob')))
  );
});

test('normal users cannot create, change, or delete entitlements', async () => {
  const db = dbFor('alice');
  const own = doc(db, 'entitlements/alice_chatgpt');
  await assertFails(setDoc(doc(db, 'entitlements/alice_other'), {
    userId: 'alice',
    toolId: 'other',
    launchAllowed: true
  }));
  await assertFails(updateDoc(own, { launchAllowed: false }));
  await assertFails(deleteDoc(own));
});

test('admins can manage entitlements and product cookie documents', async () => {
  const db = dbFor('admin-user', { admin: true });
  await assertSucceeds(setDoc(doc(db, 'entitlements/new'), {
    userId: 'alice',
    toolId: 'other'
  }));
  await assertSucceeds(getDoc(doc(db, 'product_cookies/chatgpt')));
  await assertSucceeds(updateDoc(doc(db, 'product_cookies/chatgpt'), {
    rotated: true
  }));
});

test('normal users cannot read the shared product cookie collection', async () => {
  await assertFails(
    getDoc(doc(dbFor('alice'), 'product_cookies/chatgpt'))
  );
});

test('users can read their profile but cannot replace protected payload fields', async () => {
  const db = dbFor('alice');
  await assertSucceeds(getDoc(doc(db, 'users/alice')));
  await assertFails(getDoc(doc(db, 'users/bob')));
  await assertSucceeds(updateDoc(doc(db, 'users/alice'), {
    hasPendingUnblockRequest: true
  }));
  await assertFails(updateDoc(doc(db, 'users/alice'), {
    decryptionKey: 'attacker-controlled'
  }));
});

test('legacy and modern subscriptions remain owner-scoped and admin-written', async () => {
  const alice = dbFor('alice');
  await assertSucceeds(getDoc(doc(alice, 'subscriptions/alice')));
  await assertFails(getDoc(doc(alice, 'subscriptions/bob_modern')));
  await assertFails(setDoc(doc(alice, 'subscriptions/alice_new'), {
    userId: 'alice',
    status: 'active'
  }));
});

test('workspace, device, and notification reads are owner-scoped', async () => {
  const alice = dbFor('alice');
  await assertSucceeds(getDoc(doc(alice, 'workspace_apps/alice_chatgpt')));
  await assertSucceeds(getDoc(doc(alice, 'devices/alice_phone')));
  await assertFails(getDoc(doc(alice, 'notifications/bob_notice')));
});

test('users may register only their own devices', async () => {
  const alice = dbFor('alice');
  await assertSucceeds(setDoc(doc(alice, 'devices/alice_tablet'), {
    userId: 'alice',
    deviceId: 'tablet',
    blocked: false
  }));
  await assertFails(setDoc(doc(alice, 'devices/bob_tablet'), {
    userId: 'bob',
    deviceId: 'tablet',
    blocked: false
  }));
});

test('launch logs must identify the authenticated user', async () => {
  const alice = dbFor('alice');
  await assertSucceeds(setDoc(doc(alice, 'launch_logs/own'), {
    userId: 'alice',
    toolId: 'chatgpt-premium'
  }));
  await assertFails(setDoc(doc(alice, 'launch_logs/forged'), {
    userId: 'bob',
    toolId: 'chatgpt-premium'
  }));
});

test('unmatched collections are denied', async () => {
  await assertFails(getDoc(doc(dbFor('alice'), 'private/secret')));
});
