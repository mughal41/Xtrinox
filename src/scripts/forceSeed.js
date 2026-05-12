import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  writeBatch, 
  serverTimestamp
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDco5Vq5DvjBlK8acvejIqQXHOUGD5PsNw",
  authDomain: "xtrinox-dfd69.firebaseapp.com",
  projectId: "xtrinox-dfd69",
  storageBucket: "xtrinox-dfd69.firebasestorage.app",
  messagingSenderId: "368764116011",
  appId: "1:368764116011:web:799f62ee1572cb982d9e6e",
  measurementId: "G-3KX8BDF487"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function forceSeed() {
  console.log('--- XTRINOX FORCE SEED V2 ---');
  
  const uid = "oGUe50Qhf7ZDpJh0VlIJR7SWNSk2";
  const email = "usamazafartest@gmail.com";
  const decryptionKey = "05++PhO4NtzYC4VMRIkUnnorvZgWm9CgpcZvoKTbPZM=";
  const iv = "zryL52ISe4u7SLrF";
  const ciphertext = "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";
  
  try {
    const batch = writeBatch(db);
    
    // 1. Marketplace Tools
    console.log(' - Adding marketplace tools...');
    const tools = [
      { id: 'chatgpt-premium', name: 'ChatGPT Premium', slug: 'chatgpt-premium', category: 'AI Assistant', active: true },
      { id: 'quillbot-pro', name: 'Quillbot Pro', slug: 'quillbot-pro', category: 'Writing', active: true },
      { id: 'stealth-writer', name: 'Stealth Writer', slug: 'stealth-writer', category: 'Writing', active: true },
      { id: 'turnitin-instructor', name: 'Turnitin Instructor', slug: 'turnitin-instructor', category: 'Research', active: true }
    ];
    
    for (const t of tools) {
      batch.set(doc(db, 'marketplace_tools', t.id), {
        ...t,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    // 2. Test User
    console.log(` - Setting up user: ${uid}`);
    batch.set(doc(db, 'users', uid), {
      email,
      encryptedPayload: { iv, ciphertext },
      decryptionKey,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // 3. Entitlement
    console.log(' - Granting entitlement...');
    batch.set(doc(db, 'entitlements', `${uid}_chatgpt`), {
      userId: uid,
      toolId: 'chatgpt-premium',
      payloadEnabled: true,
      launchAllowed: true,
      runtimeEnabled: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      legacyCompatible: true,
      createdAt: serverTimestamp()
    });

    await batch.commit();
    console.log('--- SUCCESS! Check your Firestore console now. ---');
    process.exit(0);
  } catch (err) {
    console.error('--- ERROR ---', err);
    process.exit(1);
  }
}

forceSeed();
