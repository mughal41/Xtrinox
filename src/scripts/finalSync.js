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

async function finalSync() {
  console.log('--- XTRINOX FINAL INFRASTRUCTURE SYNC ---');
  const uid = "oGUe50Qhf7ZDpJh0VlIJR7SWNSk2";
  const batch = writeBatch(db);

  // 1. Feature Flags
  console.log(' - Enabling Marketplace & Workspace features...');
  batch.set(doc(db, 'system_configs', 'feature_flags'), {
    marketplaceEnabled: true,
    workspaceEnabled: true,
    newRuntimeEnabled: true,
    updatedAt: serverTimestamp()
  });

  // 2. Workspace App for ChatGPT
  console.log(' - Pining ChatGPT to your Workspace dashboard...');
  batch.set(doc(db, 'workspace_apps', `${uid}_chatgpt`), {
    userId: uid,
    toolId: 'chatgpt-premium',
    pinned: true,
    lastOpenedAt: null,
    launchCount: 0,
    workspaceVisible: true,
    createdAt: serverTimestamp()
  });

  await batch.commit();
  console.log('--- SYNC COMPLETE ---');
  process.exit(0);
}

finalSync();
